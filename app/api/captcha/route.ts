import { NextRequest, NextResponse } from "next/server";
import { generateCaptcha, type CaptchaKind } from "@/lib/captcha";

/**
 * GET /api/captcha?kind=image|math
 *
 * Issues a fresh CAPTCHA challenge for the contact form. No state is kept
 * server-side — see lib/captcha.ts for how the token is self-verifying.
 */
export async function GET(request: NextRequest) {
  const kindParam = request.nextUrl.searchParams.get("kind");
  const kind: CaptchaKind = kindParam === "math" ? "math" : "image";

  try {
    const challenge = await generateCaptcha(kind);
    return NextResponse.json(challenge, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate captcha" },
      { status: 500 }
    );
  }
}
