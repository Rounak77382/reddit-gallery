/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  webpack(config) {
    config.optimization.splitChunks = false; // Disable code splitting
    return config;
  },
};

export default nextConfig;
