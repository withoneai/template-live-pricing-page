import * as stripe from "@withone/sdk/stripe";
import { CACHE_SECONDS, CURRENCY, PRODUCT_IDS } from "./config";
import { stripeScope } from "./one";
import type { Interval, Plan, PlanKind, PriceOption, PricingData } from "./types";

type ProductsOutput = NonNullable<Awaited<ReturnType<typeof runProducts>>["data"]["data"]>;
type Product = ProductsOutput[number];
type PricesOutput = NonNullable<Awaited<ReturnType<typeof runPrices>>["data"]["data"]>;
type Price = PricesOutput[number];

/**
 * The last read, reused for CACHE_SECONDS so a busy pricing page does not
 * call Stripe on every visit. Change a price and it shows up within a minute.
 */
let cache: { at: number; data: PricingData } | null = null;

async function runProducts() {
  const scope = await stripeScope();
  return scope.run(stripe.listProducts({ query: { active: true, limit: 100 } }));
}

async function runPrices() {
  const scope = await stripeScope();
  return scope.run(
    stripe.listPrices({ query: { active: true, type: "recurring", currency: CURRENCY, limit: 100 } }),
  );
}

/** Format minor units as money. Amounts of $10 and up drop the cents. */
function money(minor: number): string {
  const whole = minor >= 1000 || minor % 100 === 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: CURRENCY.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: whole ? 0 : 2,
    }).format((whole ? Math.round(minor / 100) * 100 : minor) / 100);
  } catch {
    return `$${(minor / 100).toFixed(whole ? 0 : 2)}`;
  }
}

/** Stripe hands back either an id or an expanded object. Take the id either way. */
function refId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value) {
    return String((value as { id?: unknown }).id ?? "");
  }
  return "";
}

function flag(product: Product, key: string): boolean {
  const value = (product.metadata as Record<string, string> | undefined)?.[key];
  return value === "true" || value === "1" || value === "yes";
}

function meta(product: Product, key: string): string {
  return (product.metadata as Record<string, string> | undefined)?.[key] ?? "";
}

/**
 * The products on the page, in the order you chose: PRICING_PRODUCTS if set,
 * else the ones tagged `pricing_page=true`, else every active product.
 */
function pickProducts(products: Product[]): Product[] {
  if (PRODUCT_IDS.length) {
    const byId = new Map(products.map((p) => [p.id, p]));
    return PRODUCT_IDS.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  }
  const tagged = products.filter((p) => flag(p, "pricing_page"));
  return tagged.length ? tagged : products;
}

/**
 * The price a plan shows for one interval. The product's default price wins
 * when it matches; otherwise the newest active price on that interval.
 * Stripe lists prices newest first, so the first match is the newest.
 */
function priceFor(product: Product, prices: Price[], interval: Interval): Price | undefined {
  const mine = prices.filter(
    (p) =>
      refId(p.product) === product.id &&
      p.recurring?.interval === interval &&
      (p.recurring?.interval_count ?? 1) === 1 &&
      p.billing_scheme !== "tiered" &&
      typeof p.unit_amount === "number",
  );
  const preferred = refId(product.default_price);
  return mine.find((p) => p.id === preferred) ?? mine[0];
}

function option(price: Price | undefined, interval: Interval): PriceOption | undefined {
  if (!price?.id) return undefined;
  const amount = price.unit_amount ?? 0;
  if (interval === "month") return { priceId: price.id, perMonth: money(amount), billed: "" };
  return {
    priceId: price.id,
    perMonth: money(amount / 12),
    billed: amount ? `billed ${money(amount)} yearly` : "",
  };
}

/** Read the catalog from Stripe through One and turn it into plans. */
export async function getLivePricing(): Promise<PricingData> {
  if (cache && Date.now() - cache.at < CACHE_SECONDS * 1000) return cache.data;

  const [productsRes, pricesRes] = await Promise.all([runProducts(), runPrices()]);
  const products: ProductsOutput = productsRes.data.data ?? [];
  const prices: PricesOutput = pricesRes.data.data ?? [];

  let usedPrices = 0;
  let yearlySaving = 0;
  const plans: Array<Plan & { sort: number }> = [];

  for (const product of pickProducts(products)) {
    if (!product.id) continue;
    const month = priceFor(product, prices, "month");
    const year = priceFor(product, prices, "year");
    const contact = flag(product, "pricing_contact");
    // A product with no price you can buy is only shown if you asked for a
    // "talk to sales" card. Otherwise it is a leftover, and leftovers hide.
    if (!month && !year && !contact) continue;
    usedPrices += Number(Boolean(month)) + Number(Boolean(year));

    // The yearly hint quotes the best real saving in the catalog, never a guess.
    const monthMinor = month?.unit_amount ?? 0;
    const yearMinor = year?.unit_amount ?? 0;
    if (!contact && monthMinor > 0 && yearMinor > 0) {
      yearlySaving = Math.max(yearlySaving, Math.floor((1 - yearMinor / (monthMinor * 12)) * 100));
    }

    const perMonthMinor = month?.unit_amount ?? (year?.unit_amount ?? 0) / 12;
    const kind: PlanKind = contact ? "contact" : perMonthMinor === 0 ? "free" : "paid";
    const order = Number(meta(product, "pricing_order"));

    plans.push({
      id: product.id,
      name: product.name || "Plan",
      description: product.description || "",
      features: (product.marketing_features ?? [])
        .map((f) => (f as { name?: string }).name ?? "")
        .filter(Boolean),
      kind,
      highlight: flag(product, "pricing_highlight"),
      badge: meta(product, "pricing_badge") || (flag(product, "pricing_highlight") ? "Most popular" : ""),
      monthly: contact ? undefined : option(month, "month"),
      yearly: contact ? undefined : option(year, "year"),
      // Explicit order first, then cheapest first, "talk to sales" last.
      sort: Number.isFinite(order) && order > 0 ? order : kind === "contact" ? 1e12 : 1e6 + perMonthMinor,
    });
  }

  // PRICING_PRODUCTS is already in your order; everything else is sorted.
  if (!PRODUCT_IDS.length) plans.sort((a, b) => a.sort - b.sort);

  const intervals: Interval[] = [];
  if (plans.some((p) => p.monthly)) intervals.push("month");
  if (plans.some((p) => p.yearly)) intervals.push("year");

  const data: PricingData = {
    plans: plans.map(({ sort: _sort, ...plan }) => plan),
    yearlySaving,
    intervals,
    source: {
      live: true,
      products: plans.length,
      prices: usedPrices,
      readAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    },
  };
  cache = { at: Date.now(), data };
  return data;
}

/**
 * Start a Stripe Checkout session for one price and hand back its URL.
 * Throws so the caller can show why.
 */
export async function createCheckout(priceId: string, origin: string): Promise<string> {
  // Only prices this page actually shows can be bought from it.
  const data = await getLivePricing();
  const known = data.plans.some(
    (p) => p.monthly?.priceId === priceId || p.yearly?.priceId === priceId,
  );
  if (!known) throw new Error("That plan is not on this page.");

  const scope = await stripeScope();
  const res = await scope.run(
    stripe.createCheckoutSession({
      body: {
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      },
    }),
  );
  const url = (res.data as { url?: string | null }).url;
  if (!url) throw new Error("Stripe did not return a checkout URL.");
  return url;
}
