/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // V2 was promoted to the homepage; keep the old URL working.
      { source: "/v2", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
