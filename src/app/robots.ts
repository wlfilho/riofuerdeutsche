import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/login", "/signup", "/forgot-password", "/auth"],
            },
        ],
        sitemap: "https://riofuerdeutsche.de/sitemap.xml",
    };
}
