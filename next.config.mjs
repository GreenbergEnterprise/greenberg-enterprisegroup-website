/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `sharp` is a native module used by the contact-form CAPTCHA. Keep it out of
  // the server bundle so its platform binary is required at runtime instead of
  // being bundled (bundling breaks the native addon in the serverless build,
  // which 500s /api/captcha and, via the shared import, /api/contact).
  serverExternalPackages: ["sharp"],
  async redirects() {
    return [
      // V2 was promoted to the homepage; keep the old URL working.
      { source: "/v2", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
