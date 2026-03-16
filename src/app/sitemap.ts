import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://riofuerdeutsche.de";

    return [
        {
            url: baseUrl,
            lastModified: new Date("2026-02-15"),
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/touren`,
            lastModified: new Date("2026-02-20"),
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/touren/klassiker`,
            lastModified: new Date("2026-02-18"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/natur-und-straende`,
            lastModified: new Date("2026-02-18"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/favela-tour`,
            lastModified: new Date("2026-02-18"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/kultur-und-geschichte`,
            lastModified: new Date("2026-02-18"),
            changeFrequency: "monthly",
            priority: 0.5,
        },
        {
            url: `${baseUrl}/touren/by-night`,
            lastModified: new Date("2026-02-20"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/karneval-tour`,
            lastModified: new Date("2026-02-20"),
            changeFrequency: "yearly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/fussball`,
            lastModified: new Date("2026-03-09"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/tagesausfluege`,
            lastModified: new Date("2026-03-09"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/sport-und-abenteuer`,
            lastModified: new Date("2026-03-10"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/kontakt`,
            lastModified: new Date("2026-03-15"),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified: new Date("2026-03-15"),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/datenschutz`,
            lastModified: new Date("2026-03-15"),
            changeFrequency: "monthly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/touren/regentage`,
            lastModified: new Date("2026-03-16"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/individuell`,
            lastModified: new Date("2026-03-16"),
            changeFrequency: "monthly",
            priority: 0.8,
        },
    ];
}
