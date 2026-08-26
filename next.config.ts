import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    inlineCss: true,
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        // Fotos enviadas pelos usuários (reviews) ficam no Supabase Storage.
        // Sem isso, next/image recusa otimizar essas URLs.
        protocol: 'https',
        hostname: 'bufqrownlstrhwslcpaa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/bewertungen-schreiben',
        destination: '/bewertung-schreiben',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
