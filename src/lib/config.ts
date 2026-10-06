/**
 * The one file of config. Everything tunable lives here, read from .env
 * (see .env.example for what each var means).
 */

/** The product this pricing page sells. Shown in the nav and the page title. */
export const PRODUCT_NAME = process.env.PRODUCT_NAME || "Tally";

/** ISO currency code. Only prices in this currency are shown. */
export const CURRENCY = (process.env.CURRENCY || "usd").toLowerCase();

/**
 * Which Stripe products appear. A comma-separated list of product ids. Leave it
 * empty and the page shows every active product tagged `pricing_page=true` in
 * its Stripe metadata, or, if none are tagged, every active product that has
 * a recurring price.
 */
export const PRODUCT_IDS = (process.env.PRICING_PRODUCTS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

/** How long a Stripe read is reused before the page asks again, in seconds. */
export const CACHE_SECONDS = Number(process.env.CACHE_SECONDS || 60);

/** Where a free plan's button goes. */
export const SIGNUP_URL = process.env.SIGNUP_URL || "#signup";

/** Where a "talk to sales" plan's button goes. */
export const SALES_URL = process.env.SALES_URL || "mailto:sales@example.com";

/**
 * The public URL of this site, used for Stripe's success and cancel
 * redirects. Falls back to the request's own host.
 */
export const SITE_URL = process.env.SITE_URL || "";
