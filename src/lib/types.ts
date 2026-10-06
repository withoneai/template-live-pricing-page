export type Interval = "month" | "year";

/** One way to pay for a plan: a Stripe price, already formatted. */
export interface PriceOption {
  priceId: string;
  /** The big number on the card, per month: "$24". */
  perMonth: string;
  /** The line under it: "billed $240 yearly". Empty for monthly. */
  billed: string;
}

export type PlanKind = "free" | "paid" | "contact";

export interface Plan {
  id: string;
  name: string;
  description: string;
  features: string[];
  kind: PlanKind;
  /** The one plan the page recommends. Set with `pricing_highlight=true`. */
  highlight: boolean;
  /** Small label above the name, from `pricing_badge` metadata. */
  badge: string;
  monthly?: PriceOption;
  yearly?: PriceOption;
}

export interface PricingData {
  plans: Plan[];
  /** The best yearly saving across plans, in whole percent. 0 hides the hint. */
  yearlySaving: number;
  /** Which intervals exist at all. A monthly-only catalog hides the toggle. */
  intervals: Interval[];
  /** Where the numbers came from, for the strip under the cards. */
  source: {
    live: boolean;
    products: number;
    prices: number;
    readAt: string;
  };
}
