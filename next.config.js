/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Collection art is drawn (SVG) and served as is; any photography that lands later
  // gets AVIF where the browser takes it, WebP otherwise.
  images: { formats: ['image/avif', 'image/webp'] },
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
