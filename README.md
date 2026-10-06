# Live Pricing Page

A pricing page that reads its plans, prices and feature lists straight from
your Stripe products. Change a price in Stripe and the page shows it within a
minute. Every paid plan opens a real Stripe Checkout.

Built on [One](https://www.withone.ai). Stripe is reached through one SDK, so
there is no Stripe library, no webhook and no price ids pasted into code.

![Live Pricing Page](https://www.withone.ai/images/templates/live-pricing-page.webp)

## What it does

- Reads your active Stripe products and their monthly and yearly prices.
- Shows each product's **marketing features** (Product catalog > product >
  Marketing features) as the plan's checklist.
- Adds a Monthly / Yearly switch when you sell both, and quotes the real
  yearly saving from your prices, rounded down.
- Opens Stripe Checkout for the price on screen. Promotion codes are allowed.
- Free plans link to sign-up, and a plan flagged "talk to sales" links to your
  sales page instead of checkout.

## Run it

```bash
npm install
npm run dev
```

It starts in demo mode with a sample catalog, so you can see the page before
connecting anything.

## Connect it to your Stripe

```bash
npm i -g @withone/cli
one init
one add stripe
one list          # copy the Stripe connection key
```

Then copy `.env.example` to `.env` and fill in:

| Variable | Required | What it is |
|---|---|---|
| `ONE_API_KEY` | yes | Your One API key |
| `ONE_CONNECTION_STRIPE` | yes | Your Stripe connection key on One |
| `PRODUCT_NAME` | no | Name in the nav and title (default Tally) |
| `PRICING_PRODUCTS` | no | Comma-separated product ids, in display order |
| `CURRENCY` | no | Only prices in this currency show (default usd) |
| `CACHE_SECONDS` | no | How long a Stripe read is reused (default 60) |
| `SIGNUP_URL` | no | Where the free plan's button goes |
| `SALES_URL` | no | Where "Talk to sales" goes |
| `SITE_URL` | no | Public URL for Stripe's success and cancel redirects |

Using a Stripe **restricted key**? It needs Products: Read, Prices: Read and
Checkout Sessions: Write. Without the last one the page renders fine and the
buttons say so.

## Choosing what shows

Most Stripe accounts hold old products, test plans and one-off prices, so the
page does not blindly show everything. In order:

1. `PRICING_PRODUCTS`, if set, is the exact list and order.
2. Otherwise, products with metadata `pricing_page=true`.
3. Otherwise, every active product with a recurring price.

Product metadata tunes each card:

| Key | Effect |
|---|---|
| `pricing_page` | `true` puts the product on the page |
| `pricing_order` | `1`, `2`, `3`... sets the order (default: cheapest first) |
| `pricing_highlight` | `true` marks the recommended plan |
| `pricing_badge` | Label on the card, e.g. `Best value` |
| `pricing_contact` | `true` turns the card into "Talk to sales" |

## How it fits together

```
src/lib/one.ts       Stripe through One, and what counts as configured
src/lib/pricing.ts   Reads products and prices, builds the plans, opens checkout
src/lib/config.ts    Every tunable, in one file
src/lib/demo.ts      Sample catalog for demo mode
src/app/page.tsx     The page, nav and FAQ (edit the FAQ here)
src/app/pricing.tsx  The plan cards and the Monthly / Yearly switch
src/app/actions.ts   The checkout action
src/app/welcome/     Where Stripe sends a buyer after paying
```

## Notes

- The yearly card shows the yearly price divided by 12, with the real yearly
  total underneath. Amounts of $10 and up are rounded to the dollar.
- Tiered and metered prices are skipped: a single number on a card cannot
  describe them honestly.
- Checkout only accepts a price this page is showing, so the action cannot be
  used to buy anything else in your account.
- The page reads up to 100 products and 100 prices. Bigger catalogs should
  set `PRICING_PRODUCTS`.

MIT licensed. Take it apart.
