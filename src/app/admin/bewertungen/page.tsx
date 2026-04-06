import ReviewsModeration from '@/app/admin/ReviewsModeration';

export const metadata = {
  title: 'Bewertungen — Admin',
};

export default function BewertungenPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Bewertungen</h1>
      <p className="text-gray-500 mb-8">Nutzerbewertungen prüfen und freischalten.</p>
      <ReviewsModeration />
    </div>
  );
}
