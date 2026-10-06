"use server";

import { headers } from "next/headers";
import { SITE_URL } from "@/lib/config";
import { isConfigured } from "@/lib/one";
import { createCheckout } from "@/lib/pricing";

/** Start Stripe Checkout for one price. Returns the URL to send the buyer to. */
export async function startCheckout(
  priceId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!isConfigured()) {
    return { ok: false, error: "Demo mode: connect Stripe through One to open a real checkout." };
  }
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const origin = SITE_URL.replace(/\/$/, "") || `${proto}://${host}`;
    return { ok: true, url: await createCheckout(priceId, origin) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    // A restricted Stripe key that can read prices but not open checkout is
    // the common setup mistake, and Stripe's 403 does not say so on its own.
    if (/\b403\b/.test(message)) {
      return {
        ok: false,
        error: "Your Stripe key can read prices but not open checkout. Give it Checkout Sessions: Write.",
      };
    }
    return { ok: false, error: message };
  }
}
