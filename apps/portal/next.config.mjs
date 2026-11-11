/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@camino/contracts'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
