import type { PricingData } from "./types";

/**
 * Sample catalog for demo mode: what the page shows before Stripe is
 * connected. Shaped exactly like a live read, so the UI cannot tell.
 */
export const DEMO_PRICING: PricingData = {
  yearlySaving: 16,
  intervals: ["month", "year"],
  source: { live: false, products: 4, prices: 4, readAt: "sample data" },
  plans: [
    {
      id: "demo_free",
      name: "Hobby",
      description: "For side projects and trying things out.",
      kind: "free",
      highlight: false,
      badge: "",
      features: [
        "1 project",
        "10,000 events a month",
        "7-day history",
        "Community support",
      ],
      monthly: { priceId: "demo_free_m", perMonth: "$0", billed: "" },
      yearly: { priceId: "demo_free_y", perMonth: "$0", billed: "" },
    },
    {
      id: "demo_pro",
      name: "Pro",
      description: "For a product with real users and a team of one or two.",
      kind: "paid",
      highlight: false,
      badge: "",
      features: [
        "5 projects",
        "1M events a month",
        "1-year history",
        "Funnels and retention",
        "Email support",
      ],
      monthly: { priceId: "demo_pro_m", perMonth: "$24", billed: "" },
      yearly: { priceId: "demo_pro_y", perMonth: "$20", billed: "billed $240 yearly" },
    },
    {
      id: "demo_team",
      name: "Team",
      description: "For a growing team that ships every week.",
      kind: "paid",
      highlight: true,
      badge: "Most popular",
      features: [
        "Unlimited projects",
        "10M events a month",
        "Unlimited history",
        "Shared dashboards and alerts",
        "SSO with Google",
        "Priority support",
      ],
      monthly: { priceId: "demo_team_m", perMonth: "$79", billed: "" },
      yearly: { priceId: "demo_team_y", perMonth: "$66", billed: "billed $790 yearly" },
    },
    {
      id: "demo_enterprise",
      name: "Enterprise",
      description: "For volume, procurement and a security review.",
      kind: "contact",
      highlight: false,
      badge: "",
      features: [
        "Everything in Team",
        "Custom event volume",
        "SAML SSO and audit log",
        "99.9% uptime SLA",
        "A named engineer",
      ],
    },
  ],
};
