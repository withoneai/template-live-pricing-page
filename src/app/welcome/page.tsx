import { PRODUCT_NAME } from "@/lib/config";

/** Where Stripe sends the buyer after a successful checkout. */
export default function Welcome() {
  return (
    <div className="shell">
      <div className="wrap welcome">
        <div className="eyebrow">Payment received</div>
        <h1>Welcome to {PRODUCT_NAME}.</h1>
        <p>Stripe has your subscription and a receipt is on its way to your inbox.</p>
        <a className="btn btn-primary" href="/">
          Back to pricing
        </a>
      </div>
    </div>
  );
}
