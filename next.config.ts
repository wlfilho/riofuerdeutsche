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
    // Next 16 ignora `quality` que não esteja nesta lista, caindo no default 75
    // em silêncio — foi o que aconteceu com o quality={90} do herói do transfer,
    // que nunca teve efeito. 50 é a qualidade usada no resto do projeto (mesma
    // do pipeline de fotos de review).
    qualities: [50, 75],
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
