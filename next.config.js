/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: [
      'dkyikirsvpauhbexbhvu.supabase.co',
      'zdiosdkoxcimlovewroz.supabase.co',
      'wsrv.nl',
      'images.unsplash.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/location/:path*',
        destination: '/escorts-in/:path*',
        permanent: true,
      },
      {
        source: '/sitemap.txt',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/:category(thick|slim|curvy|vip|massage)-escorts-in/:location*',
        destination: '/category/:category/:location*',
      },
    ]
  },
  // Force trailing slash for consistency (better for SEO consolidation)
  trailingSlash: false,
}

export default nextConfig;