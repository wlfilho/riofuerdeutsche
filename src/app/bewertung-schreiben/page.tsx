import { Metadata } from "next";
import ReviewForm from "./ReviewForm";

export const metadata: Metadata = {
    title: "Bewertung schreiben — Rio für Deutsche",
    description: "Hat dir dein Erlebnis mit Will in Rio de Janeiro gefallen? Teile deine Erfahrungen und hilf anderen deutschen Reisenden bei der Planung ihrer Tour.",
    openGraph: {
        title: "Bewertung schreiben — Rio für Deutsche",
        description: "Deine persönliche Bewertung für Will — dein deutschsprachiger Reiseleiter in Rio.",
    }
};

export default function BewertungSchreibenPage() {
    return <ReviewForm />;
}
