/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  images: {
    unoptimized: false,
  },
}

export default nextConfig
