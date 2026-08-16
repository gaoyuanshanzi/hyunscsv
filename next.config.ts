import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses Turbopack by default.
  // FortuneSheet is CSR-only (dynamic import with ssr:false handles SSR exclusion).
  // No webpack/turbopack override needed.
  turbopack: {},
};

export default nextConfig;
