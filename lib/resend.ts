import { Resend } from "resend";

/**
 * Returns a Resend client, or null if RESEND_API_KEY isn't configured yet.
 * Callers should treat email as best-effort: a missing/failed send should
 * never block a contact submission that already saved to the database.
 */
let client: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/**
 * The "from" address used to send. Defaults to Resend's shared sandbox
 * sender, which only delivers to the Resend account's own verified email —
 * fine for testing, but a verified sending domain (set via CONTACT_FROM_EMAIL)
 * is required before this can email real visitors.
 */
export function getFromAddress(): string {
  return process.env.CONTACT_FROM_EMAIL || "Greenberg Enterprise Group <onboarding@resend.dev>";
}
