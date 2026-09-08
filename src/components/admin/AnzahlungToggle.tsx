'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';

export interface TourDateDeposit {
  id: string;
  anzahlung_paid: boolean;
}

/**
 * Toggle de "Sinal pago" reaproveitável fora do calendário (drawer do CRM,
 * proposta): um lead pode ter várias `tour_dates` (tour de vários dias), mas
 * o sinal é um só pra reserva inteira — marcar/desmarcar aqui atualiza todas
 * de uma vez, em vez de abrir o modal do calendário pra cada dia.
 *
 * Não renderiza nada sem nenhuma tour_date: sem data marcada não há o que
 * cobrar sinal ainda.
 *
 * Marcar o sinal fecha a venda: o trigger `tour_dates_sync_lead_status_upd`
 * leva o lead pra `closed` e, dali, a proposta pra `accepted` e o calendário
 * pra `fechado`. Por isso o `router.refresh()` no fim — sem ele o botão fica
 * verde mas o resto da tela (status do lead, da proposta) continua no estado
 * velho até um F5.
 */
export default function AnzahlungToggle({ tourDates }: { tourDates: TourDateDeposit[] }) {
  const [dates, setDates] = useState(tourDates);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin.calendario');

  if (dates.length === 0) return null;

  const allPaid = dates.every(d => d.anzahlung_paid);

  const toggle = async () => {
    const next = !allPaid;
    setSaving(true);
    const previous = dates;
    setDates(prev => prev.map(d => ({ ...d, anzahlung_paid: next })));
    try {
      const results = await Promise.all(
        dates.map(d =>
          fetch(`/api/admin/tour-dates/${d.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anzahlung_paid: next }),
          }),
        ),
      );
      if (results.some(r => !r.ok)) setDates(previous);
      else router.refresh();
    } catch {
      setDates(previous);
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors disabled:opacity-50 ${
        allPaid
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      }`}
    >
      {allPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
      {allPaid ? t('sinalPago') : t('sinalPendente')}
    </button>
  );
}
