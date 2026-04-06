/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Les navigateurs demandent souvent /favicon.ico par défaut ; on sert le SVG dédié.
    return [{ source: '/favicon.ico', destination: '/favicon.svg' }];
  },
};

export default nextConfig;
