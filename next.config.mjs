/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["snoowrap", "request-promise", "request"],
};

export default nextConfig;
