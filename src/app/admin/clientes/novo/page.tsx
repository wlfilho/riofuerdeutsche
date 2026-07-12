'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const INPUT_CLS =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400';

export default function NovoClientePage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState('1');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [tourDetails, setTourDetails] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!name.trim() || !email.trim() || !arrivalDate || !departureDate) {
      return 'Bitte alle Pflichtfelder ausfüllen.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Bitte eine gültige E-Mail-Adresse eingeben.';
    }
    if (new Date(departureDate) < new Date(arrivalDate)) {
      return 'Das Abreisedatum muss nach dem Ankunftsdatum liegen.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          pax: pax !== '' ? parseInt(pax) : 1,
          arrival_date: arrivalDate,
          departure_date: departureDate,
          tour_details: tourDetails.trim() || undefined,
          total_amount: totalAmount !== '' ? parseFloat(totalAmount) : undefined,
          deposit_amount: depositAmount !== '' ? parseFloat(depositAmount) : undefined,
          internal_notes: internalNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Fehler beim Speichern.');
        return;
      }

      router.push(`/admin/clientes/${data.client.id}`);
    } catch {
      setError('Netzwerkfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/admin/clientes" className="hover:text-gray-600 transition-colors">
            Kunden
          </Link>
          <span>→</span>
          <span className="text-gray-600">Neuer Kunde</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Neuen Kunden anlegen</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name des Touristen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="z.B. Maria Müller"
                disabled={loading}
                className={INPUT_CLS}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail-Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={loading}
                className={INPUT_CLS}
              />
            </div>

            {/* Phone + Pax */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+49 170 000 0000"
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anzahl Personen (Pax)
                </label>
                <input
                  type="number"
                  min="1"
                  value={pax}
                  onChange={e => setPax(e.target.value)}
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ankunftsdatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  onChange={e => setArrivalDate(e.target.value)}
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Abreisedatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={e => setDepartureDate(e.target.value)}
                  min={arrivalDate || undefined}
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Tour Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Details der Tour
              </label>
              <textarea
                value={tourDetails}
                onChange={e => setTourDetails(e.target.value)}
                rows={3}
                placeholder="z.B. Flughafen-Transfer, Klassiker Tour, Favela Tour Rocinha, Maracanã-Spiel"
                disabled={loading}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gesamtbetrag (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anzahlung erhalten (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  disabled={loading}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interne Notizen{' '}
                <span className="text-xs text-gray-400">(nur für dich sichtbar)</span>
              </label>
              <textarea
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                rows={3}
                placeholder="Notizen, die nicht an den Kunden weitergeleitet werden"
                disabled={loading}
                className={`${INPUT_CLS} resize-none`}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/admin/clientes"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird gespeichert...' : 'Kunden anlegen & E-Mail senden'}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            Nach dem Speichern wird automatisch die Bestätigungs-E-Mail an den Touristen gesendet.
          </p>
        </form>
      </div>
    </div>
  );
}
