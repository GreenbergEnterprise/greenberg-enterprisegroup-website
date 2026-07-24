import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import sharp from "sharp";

/**
 * Self-hosted CAPTCHA — no third-party service or API key required.
 *
 * A challenge (either a noisy-text image or a simple arithmetic question)
 * is generated on request. Its answer travels with the client as an
 * AES-256-GCM encrypted, time-limited token: the code is never visible in
 * the token (unlike a merely-signed token, which anyone reading the network
 * response could just read the answer out of), and any tampering with it
 * fails to decrypt. This works statelessly across serverless invocations —
 * no database round trip, nothing to scrape.
 */

export type CaptchaKind = "image" | "math";

export interface CaptchaChallenge {
  token: string;
  kind: CaptchaKind;
  /** data: URI, present when kind === "image" */
  image?: string;
  /** present when kind === "math" */
  question?: string;
}

interface TokenPayload {
  k: CaptchaKind;
  c: string;
  e: number; // expires (ms epoch)
}

const TTL_MS = 10 * 60 * 1000; // 10 minutes
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function getKey(): Buffer {
  const secret =
    process.env.CAPTCHA_SECRET ||
    (process.env.NODE_ENV !== "production" ? "dev-only-insecure-captcha-secret" : undefined);
  if (!secret) {
    throw new Error(
      "CAPTCHA_SECRET is not set. Add it to .env.local (development) or your " +
        "hosting provider's environment variables (production)."
    );
  }
  return createHash("sha256").update(secret).digest();
}

function issueToken(kind: CaptchaKind, code: string): string {
  const payload: TokenPayload = { k: kind, c: code, e: Date.now() + TTL_MS };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

function openToken(token: string): TokenPayload | null {
  try {
    const buf = Buffer.from(token, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
    return JSON.parse(dec.toString("utf8"));
  } catch {
    return null; // tampered, wrong key, or malformed — treat as invalid
  }
}

/** Verifies a submitted token + the visitor's typed answer. */
export function verifyCaptcha(token: string | undefined, answer: string | undefined): boolean {
  if (!token || !answer) return false;
  const payload = openToken(token);
  if (!payload || Date.now() > payload.e) return false;
  return answer.trim().toUpperCase() === payload.c.trim().toUpperCase();
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomCode(length = 5): string {
  let out = "";
  for (let i = 0; i < length; i++) out += CHARS[randomInt(CHARS.length)];
  return out;
}

function renderNoisyTextSvg(code: string): string {
  const width = 180;
  const height = 64;
  const palette = ["#123b2d", "#1b75bb", "#cf4514", "#0c3a61"];
  const pick = (arr: string[]) => arr[randomInt(arr.length)];
  const rand = (min: number, max: number) => min + Math.random() * (max - min);

  let glyphs = "";
  const spacing = (width - 24) / code.length;
  for (let i = 0; i < code.length; i++) {
    const x = 16 + i * spacing + rand(-3, 3);
    const y = height / 2 + rand(-7, 7);
    const rot = rand(-24, 24);
    const size = rand(28, 36);
    glyphs += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size.toFixed(
      1
    )}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="${pick(
      palette
    )}" transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})">${code[i]}</text>`;
  }

  let noise = "";
  for (let i = 0; i < 5; i++) {
    noise += `<line x1="${rand(0, width).toFixed(1)}" y1="${rand(0, height).toFixed(
      1
    )}" x2="${rand(0, width).toFixed(1)}" y2="${rand(0, height).toFixed(1)}" stroke="${pick(
      palette
    )}" stroke-width="1" opacity="0.3"/>`;
  }
  for (let i = 0; i < 26; i++) {
    noise += `<circle cx="${rand(0, width).toFixed(1)}" cy="${rand(0, height).toFixed(
      1
    )}" r="${rand(0.6, 1.7).toFixed(1)}" fill="${pick(palette)}" opacity="0.3"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#fbfaf8"/>${noise}${glyphs}</svg>`;
}

async function imageChallenge(): Promise<CaptchaChallenge> {
  const code = randomCode();
  const png = await sharp(Buffer.from(renderNoisyTextSvg(code))).png().toBuffer();
  return {
    token: issueToken("image", code),
    kind: "image",
    image: `data:image/png;base64,${png.toString("base64")}`,
  };
}

function mathChallenge(): CaptchaChallenge {
  const a = 1 + randomInt(9);
  const b = 1 + randomInt(9);
  const useMinus = Math.random() < 0.5 && a >= b;
  const result = useMinus ? a - b : a + b;
  return {
    token: issueToken("math", String(result)),
    kind: "math",
    question: `${a} ${useMinus ? "−" : "+"} ${b}`,
  };
}

export async function generateCaptcha(kind: CaptchaKind): Promise<CaptchaChallenge> {
  return kind === "math" ? mathChallenge() : imageChallenge();
}
