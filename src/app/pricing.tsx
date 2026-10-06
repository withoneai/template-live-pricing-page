"use client";

import { useState, useTransition } from "react";
import type { Interval, Plan, PricingData } from "@/lib/types";
import { startCheckout } from "./actions";

/**
 * The plan cards. Every price arrives from the server already formatted; this
 * component only switches between monthly and yearly and opens checkout.
 */
export function Pricing({
  data,
  live,
  signupUrl,
  salesUrl,
}: {
  data: PricingData;
  live: boolean;
  signupUrl: string;
  salesUrl: string;
}) {
  const both = data.intervals.length > 1;
  const [interval, setInterval] = useState<Interval>(data.intervals.includes("year") && !data.intervals.includes("month") ? "year" : "month");

  return (
    <>
      <header className="hero">
        <div className="eyebrow">Pricing</div>
        <h1>Start free. Pay when it matters.</h1>
        <p>Every plan includes the full product. You only choose how much of it you use.</p>

        {both && (
          <div className="toggle" role="tablist" aria-label="Billing period">
            {(["month", "year"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={interval === value}
                className={interval === value ? "on" : ""}
                onClick={() => setInterval(value)}
              >
                {value === "month" ? "Monthly" : "Yearly"}
                {value === "year" && data.yearlySaving > 0 && (
                  <span className="save">save {data.yearlySaving}%</span>
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      {data.plans.length === 0 ? (
        <div className="empty">
          No plans to show. Tag the Stripe products you sell with <code>pricing_page=true</code>, or
          list their ids in <code>PRICING_PRODUCTS</code>.
        </div>
      ) : (
        <div className="plans" style={{ gridTemplateColumns: `repeat(${Math.min(data.plans.length, 4)}, 1fr)` }}>
          {data.plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              interval={interval}
              live={live}
              signupUrl={signupUrl}
              salesUrl={salesUrl}
            />
          ))}
        </div>
      )}

      <div className="source">
        <span className={`dot ${data.source.live ? "live" : ""}`} />
        {data.source.live ? (
          <>
            Live from Stripe · {data.source.products} products · {data.source.prices} prices · read{" "}
            {data.source.readAt}
          </>
        ) : (
          <>Sample catalog · connect Stripe and these become your products and prices</>
        )}
      </div>
    </>
  );
}

function PlanCard({
  plan,
  interval,
  live,
  signupUrl,
  salesUrl,
}: {
  plan: Plan;
  interval: Interval;
  live: boolean;
  signupUrl: string;
  salesUrl: string;
}) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  // A plan sold on one interval only keeps showing that price.
  const price = (interval === "year" ? plan.yearly : plan.monthly) ?? plan.monthly ?? plan.yearly;
  const onOther = Boolean(price && price !== (interval === "year" ? plan.yearly : plan.monthly));

  function buy() {
    if (!price) return;
    setNote("");
    start(async () => {
      const res = await startCheckout(price.priceId);
      if (res.ok) window.location.href = res.url;
      else setNote(res.error);
    });
  }

  return (
    <article className={`plan ${plan.highlight ? "pick" : ""}`}>
      <div className="plan-top">
        <h2>{plan.name}</h2>
        {plan.badge && <span className="badge">{plan.badge}</span>}
      </div>
      <p className="desc">{plan.description}</p>

      <div className="price">
        {plan.kind === "contact" ? (
          <span className="amt custom">Custom</span>
        ) : (
          <>
            <span className="amt">{price?.perMonth}</span>
            <span className="per">/ month</span>
          </>
        )}
      </div>
      <div className="billed">
        {plan.kind === "contact"
          ? "annual contract"
          : plan.kind === "free"
            ? "free forever"
            : price?.billed || (onOther ? "monthly only" : "billed monthly")}
      </div>

      {plan.kind === "contact" ? (
        <a className="btn btn-ghost wide" href={salesUrl}>
          Talk to sales
        </a>
      ) : plan.kind === "free" ? (
        <a className="btn btn-ghost wide" href={signupUrl}>
          Start free
        </a>
      ) : (
        <button
          className={`btn wide ${plan.highlight ? "btn-primary" : "btn-ghost"}`}
          onClick={buy}
          disabled={pending}
        >
          {pending ? "Opening checkout…" : `Choose ${plan.name}`}
        </button>
      )}
      {note && <p className={`note ${live ? "err" : ""}`}>{note}</p>}

      {plan.features.length > 0 && (
        <ul className="feats">
          {plan.features.map((f) => (
            <li key={f}>
              <span className="tick" aria-hidden>
                ✓
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
