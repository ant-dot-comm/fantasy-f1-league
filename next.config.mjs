/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
    MONGODB_URI: process.env.MONGODB_URI,
  },
  output: "export",
  basePath: "/fantasy-f1-league",
};

export default nextConfig;
