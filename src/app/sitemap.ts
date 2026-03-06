import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://riofuerdeutsche.de";

    return [
        // ========== HOMEPAGE ==========
        {
            url: baseUrl,
            lastModified: "2026-02-15",
            changeFrequency: "weekly",
            priority: 1.0,
        },

        // ========== TOURS (Prioridade Alta - Vendas) ==========
        {
            url: `${baseUrl}/touren`,
            lastModified: "2026-02-20",
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/touren/klassiker`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/touren/natur-und-straende`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/touren/favela-tour`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/touren/kultur-und-geschichte`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/touren/by-night`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/karneval-tour`,
            lastModified: "2026-02-20",
            changeFrequency: "yearly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/fussball-tour`,
            lastModified: "2026-02-20",
            changeFrequency: "yearly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/tagesausfluge`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/individuelle-tour`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.8,
        },

        // ========== SEGURANÇA (Diferencial - High Traffic) ==========
        {
            url: `${baseUrl}/sicherheit`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.9,
        },

        // ========== CONSULTORIA (Conversão) ==========
        {
            url: `${baseUrl}/unterkunft/beratung`,
            lastModified: "2026-02-15",
            changeFrequency: "weekly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/unterkunft/empfehlungen`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },

        // ========== RIO GUIDE (Traffic) ==========
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/rio-guide/beste-reisezeit`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/karneval`,
            lastModified: "2026-02-18",
            changeFrequency: "yearly",
            priority: 0.85,
        },
        {
            url: `${baseUrl}/rio-guide/transport`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/budget`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/essen-nightlife`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },

        // ========== BAIRROS (Local SEO) ==========
        {
            url: `${baseUrl}/stadtviertel/ipanema`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stadtviertel/copacabana`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stadtviertel/botafogo`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stadtviertel/leblon`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/stadtviertel/santa-teresa`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/stadtviertel/lapa`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/stadtviertel/flamengo`,
            lastModified: "2026-02-18",
            changeFrequency: "monthly",
            priority: 0.75,
        },

        // ========== EBOOK (Lead Magnet) ==========
        {
            url: `${baseUrl}/ebook`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.8,
        },

        // ========== BLOG (SEO + Content) ==========
        {
            url: `${baseUrl}/blog/karneval-2026`,
            lastModified: "2026-03-02",
            changeFrequency: "never",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/brasilien-reiseblog`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/copacabana-vs-ipanema`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/uber-in-rio`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/rio-mit-kindern`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/packliste-rio`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },
        {
            url: `${baseUrl}/blog/brasilien-rundreise`,
            lastModified: "2026-02-20",
            changeFrequency: "monthly",
            priority: 0.75,
        },

        // ========== PÁGINAS DE SUPORTE ==========
        {
            url: `${baseUrl}/ueber-will`,
            lastModified: "2026-02-15",
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/bewertungen`,
            lastModified: "2026-02-15",
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/kontakt`,
            lastModified: "2026-02-15",
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/datenschutz`,
            lastModified: "2026-02-15",
            changeFrequency: "yearly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified: "2026-02-15",
            changeFrequency: "yearly",
            priority: 0.5,
        },
    ];
}