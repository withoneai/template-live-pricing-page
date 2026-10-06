import { PRODUCT_NAME, SALES_URL, SIGNUP_URL } from "@/lib/config";
import { DEMO_PRICING } from "@/lib/demo";
import { isConfigured } from "@/lib/one";
import { getLivePricing } from "@/lib/pricing";
import { Pricing } from "./pricing";

export const dynamic = "force-dynamic";

const FAQ = [
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrades apply right away and are prorated. Downgrades take effect at the end of the current billing period.",
  },
  {
    q: "What happens if I go over my event limit?",
    a: "Nothing breaks. We keep collecting, show you the overage in the dashboard, and ask you to move up a plan if it happens two months running.",
  },
  {
    q: "Do you offer discounts for startups or nonprofits?",
    a: "Yes, 50% off Pro or Team for the first year if you are under two years old or a registered nonprofit. Ask from the billing page.",
  },
  {
    q: "How do I cancel?",
    a: "From Settings, Billing. You keep access until the end of the period you paid for, and you can export everything before it ends.",
  },
];

export default async function Page() {
  const configured = isConfigured();
  let data = DEMO_PRICING;
  let loadError = "";

  if (configured) {
    try {
      data = await getLivePricing();
    } catch (err) {
      loadError = err instanceof Error ? err.message : "Failed to read Stripe";
      data = DEMO_PRICING;
    }
  }

  return (
    <div className="shell">
      {!configured && (
        <div className="banner">
          Sample prices. Copy <code>.env.example</code> to <code>.env</code> and add your{" "}
          <a href="https://www.withone.ai/docs" target="_blank" rel="noreferrer">
            One
          </a>{" "}
          key to show your live Stripe catalog.
        </div>
      )}
      {loadError && (
        <div className="banner err">Could not read Stripe: {loadError}. Showing sample prices.</div>
      )}

      <div className="wrap">
        <nav className="nav">
          <div className="brand">
            <span className="logo" aria-hidden>
              {PRODUCT_NAME.slice(0, 1)}
            </span>
            {PRODUCT_NAME}
          </div>
          <div className="links">
            <span>Product</span>
            <span>Docs</span>
            <span className="here">Pricing</span>
            <span>Changelog</span>
          </div>
          <a className="btn btn-ghost" href={SIGNUP_URL}>
            Sign in
          </a>
        </nav>

        <Pricing
          data={data}
          live={configured && !loadError}
          signupUrl={SIGNUP_URL}
          salesUrl={SALES_URL}
        />

        <section className="faq">
          <h2>Questions</h2>
          <div className="faq-grid">
            {FAQ.map((item) => (
              <div className="qa" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="foot">
          <span>
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </span>
          <span>
            Prices read from Stripe through{" "}
            <a href="https://www.withone.ai" target="_blank" rel="noreferrer">
              One
            </a>
          </span>
        </footer>
      </div>
    </div>
  );
}
