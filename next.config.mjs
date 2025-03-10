/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_MONGODB_URI: process.env.NEXT_PUBLIC_MONGODB_URI,
    MONGODB_URI: process.env.MONGODB_URI,
  },
  images: {
    unoptimized: true, // ✅ Fixes issues with image loading on static hosting
  },
  trailingSlash: true, // ✅ Ensures proper routing
};

export default nextConfig;
