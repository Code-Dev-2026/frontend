/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@camino/contracts', '@camino/domain'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
