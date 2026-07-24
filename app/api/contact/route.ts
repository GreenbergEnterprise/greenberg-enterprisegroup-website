import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyCaptcha } from "@/lib/captcha";
import { getResend, getFromAddress } from "@/lib/resend";
import { content } from "@/lib/content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 4;

interface ContactBody {
  name?: string;
  email?: string;
  message?: string;
  company?: string; // honeypot — real visitors never fill this in
  captchaToken?: string;
  captchaAnswer?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots that fill every field get a fake success, nothing is saved or sent.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!verifyCaptcha(body.captchaToken, body.captchaAnswer)) {
    return NextResponse.json(
      { error: "That CAPTCHA answer didn't match. Please try again.", captchaFailed: true },
      { status: 400 }
    );
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const message = (body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  let db;
  try {
    db = await getDb();
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "The database is not configured yet." },
      { status: 500 }
    );
  }

  const submissions = db.collection("contact_submissions");

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recentCount = await submissions.countDocuments({
    $or: [{ email: email.toLowerCase() }, { ip }],
    createdAt: { $gte: since },
  });
  if (recentCount >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many submissions — please try again in a few minutes." },
      { status: 429 }
    );
  }

  await submissions.insertOne({
    name,
    email: email.toLowerCase(),
    message,
    ip,
    userAgent: request.headers.get("user-agent") || "unknown",
    createdAt: new Date(),
  });

  // Email is best-effort: a delivery failure here should never make the visitor
  // think their message wasn't received, since it's already safely in the database.
  const resend = getResend();
  if (resend) {
    const from = getFromAddress();
    const notifyTo = process.env.CONTACT_TO_EMAIL || content.brand.email;

    await Promise.allSettled([
      resend.emails.send({
        from,
        to: email,
        subject: `We received your message — ${content.brand.name}`,
        text: `Hi ${name},\n\nThanks for reaching out to ${content.brand.name}. We received your message and will be in touch soon.\n\nYour message:\n${message}\n\n— ${content.brand.name}`,
        html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for reaching out to ${escapeHtml(
          content.brand.name
        )}. We received your message and will be in touch soon.</p><p style="color:#666"><strong>Your message:</strong><br/>${escapeHtml(
          message
        ).replace(/\n/g, "<br/>")}</p><p>— ${escapeHtml(content.brand.name)}</p>`,
      }),
      resend.emails.send({
        from,
        to: notifyTo,
        replyTo: email,
        subject: `New contact form submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nIP: ${ip}\n\nMessage:\n${message}`,
        html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br/><strong>Email:</strong> ${escapeHtml(
          email
        )}</p><p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
      }),
    ]).then((results) => {
      for (const r of results) {
        if (r.status === "rejected") {
          console.error("Contact form email failed:", r.reason);
        } else if (r.value.error) {
          console.error("Contact form email failed:", r.value.error);
        }
      }
    });
  } else {
    console.warn("RESEND_API_KEY not set — skipping confirmation/notification emails.");
  }

  return NextResponse.json({ ok: true });
}
