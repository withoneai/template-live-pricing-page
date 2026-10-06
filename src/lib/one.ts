import type { ConnectionScope } from "@withone/sdk";

/** The One API key: `one init` writes it to ~/.one/config.json, copy it here. */
const apiKey = process.env.ONE_API_KEY || process.env.ONE_SECRET || "";

/** Live mode needs the One key and a Stripe connection. Nothing else. */
export function isConfigured(): boolean {
  return Boolean(apiKey && process.env.ONE_CONNECTION_STRIPE);
}

/**
 * Stripe, scoped through One. Imported lazily so demo mode never loads the
 * SDK's native client (which needs a real Node runtime).
 */
export async function stripeScope(): Promise<ConnectionScope> {
  const { One } = await import("@withone/sdk");
  return new One(apiKey).connection(process.env.ONE_CONNECTION_STRIPE || "");
}
