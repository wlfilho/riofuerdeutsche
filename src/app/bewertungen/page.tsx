import { createClient } from "@/utils/supabase/server";
import { Star, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import ReviewCard from "@/components/ReviewCard";

export const revalidate = 60;

export const metadata = {
    title: "Bewertungen — Rio für Deutsche",
    description: "Echte Erfahrungen von deutschen Touristen mit Will, dem deutschsprachigen Reiseleiter in Rio de Janeiro.",
};

export default async function BewertungenPage() {
    const supabase = await createClient();

    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, created_at, attractions, nickname, rating, title, body')
        .eq('status', 'approved')
        .order('approved_at', { ascending: false });

    if (error) {
        console.error('Error fetching reviews:', error);
    }

    const hasReviews = reviews && reviews.length > 0;
    
    // Calcular média
    const totalRating = reviews?.reduce((sum, r) => sum + r.rating, 0) || 0;
    const avgRating = hasReviews ? (totalRating / reviews.length).toFixed(1) : 0;
    const reviewCount = reviews?.length || 0;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Hero */}
            <div className="bg-white border-b border-gray-200 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Was unsere Gäste sagen
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Echte Erfahrungen von deutschen Reisenden — ungefiltert und authentisch.
                    </p>

                    {hasReviews && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-yellow-50 px-6 py-3 rounded-full border border-yellow-100">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xl font-bold text-gray-900">{avgRating}</span>
                                <span className="text-gray-400 font-medium">von 5</span>
                                <span className="mx-2 text-gray-300">·</span>
                                <span className="text-gray-700 font-medium">{reviewCount} Bewertungen</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                {!hasReviews ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-200 shadow-sm max-w-2xl mx-auto px-6">
                        <div className="flex justify-center mb-6">
                            <Star className="w-20 h-20 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Noch keine Bewertungen vorhanden.
                        </h2>
                        <p className="text-gray-500 mb-8">Sei der Erste!</p>
                        <Link
                            href="/bewertung-schreiben"
                            className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 px-8 rounded-xl transition-all shadow-sm hover:shadow-lg group"
                        >
                            Bewertung schreiben
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                )}

                {/* Final CTA */}
                {hasReviews && (
                    <div className="mt-20 text-center py-12 bg-gray-900 rounded-3xl text-white px-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Hast du eine Tour mit Will gemacht?
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Teile deine Erlebnisse und hilf anderen Reisenden bei ihrer Planung.
                        </p>
                        <Link
                            href="/bewertung-schreiben"
                            className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 px-10 rounded-xl transition-all shadow-sm hover:shadow-lg group"
                        >
                            Deine Bewertung schreiben
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </main>

            <footer className="max-w-7xl mx-auto py-12 px-4 text-center text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Rio für Deutsche — Deine Experten in Rio de Janeiro
            </footer>
        </div>
    );
}
