import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ReviewForm from "./ReviewForm";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("public.bewertungen.form");
    return {
        title: t("metaTitle"),
        description: "Hat dir dein Erlebnis mit Will in Rio de Janeiro gefallen? Teile deine Erfahrungen und hilf anderen deutschen Reisenden bei der Planung ihrer Tour.",
        openGraph: {
            title: t("metaTitle"),
            description: t("ogDescription"),
        }
    };
}

export default function BewertungSchreibenPage() {
    return <ReviewForm />;
}
