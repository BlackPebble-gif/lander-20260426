/** @type {import('next').NextConfig} */
const nextConfig = {
  // twilio uses Node built-ins; keep it server-side only
  experimental: {
    serverComponentsExternalPackages: ['twilio'],
  },
}

export default nextConfig
