import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = "https://riofuerdeutsche.de";
    const today = new Date().toISOString().split("T")[0];

    return [
        {
            url: baseUrl,
            lastModified: today,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${baseUrl}/touren`,
            lastModified: today,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/touren/klassiker`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/natur-und-straende`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/favela-tour`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/by-night`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/karneval-tour`,
            lastModified: today,
            changeFrequency: "yearly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/touren/kultur-und-geschichte`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/fussball`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/tagesausfluege`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/sport-und-abenteuer`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/regentage`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/individuell`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/touren/flughafen-transfer`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/frauen-wm-2027`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.9,
        },
        {
            url: `${baseUrl}/frauen-wm-2027/spielplan`,
            lastModified: today,
            // Semanal até a Auslosung (11/12/2026): a página muda a cada
            // rodada de play-offs e vira a mais quente do cluster no sorteio.
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/christus-erloeser`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/zuckerhut`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/maracana`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/escadaria-selaron`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/rocinha`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/santa-marta`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sehenswuerdigkeiten/the-maze`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/rio-guide/sicherheit/ist-rio-gefaehrlich`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/ueber-will`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/kontakt`,
            lastModified: today,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/impressum`,
            lastModified: "2026-03-15",
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/datenschutz`,
            lastModified: "2026-03-15",
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];
}
