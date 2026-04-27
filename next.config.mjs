/** @type {import('next').NextConfig} */
const nextConfig = {
  // twilio uses Node built-ins; keep it server-side only
  serverExternalPackages: ['twilio'],
}

export default nextConfig
