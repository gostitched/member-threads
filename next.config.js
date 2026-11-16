/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Collection art is drawn (SVG) and served as is; any photography that lands later
  // gets AVIF where the browser takes it, WebP otherwise.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Catalog photos are fetched from the dashboard once, server-side, and served from
    // this site's CDN (see src/lib/catalog/fast.ts). An asset URL is per file, so a month
    // is safe: a replaced photo arrives under a new URL.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://app.gostitched.com').hostname,
        pathname: '/api/embed/v1/catalog/**',
      },
    ],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [
      { source: '/services', destination: '/custom', permanent: true },
      // The nav says "Pieces" and "Collections"; the routes keep their names.
      { source: '/pieces', destination: '/catalog', permanent: false },
      { source: '/pieces/:slug', destination: '/catalog/:slug', permanent: false },
      { source: '/collections', destination: '/work', permanent: false },
    ]
  },
}

module.exports = nextConfig
