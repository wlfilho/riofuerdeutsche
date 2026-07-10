'use client';

import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import type { TourDate } from '@/lib/tourDates';
import { WEEKDAY_SHORT_PT, formatTime, parseISODate } from '@/lib/calendarDates';

function StatusBadge({ status }: { status: TourDate['status'] }) {
  return status === 'fechado' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3 shrink-0" />
      Fechado
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold whitespace-nowrap">
      <Send className="w-3 h-3 shrink-0" />
      Proposta enviada
    </span>
  );
}

function InfoItem({
  icon: Icon,
  label,
  muted = false,
  wrap = false,
  children,
}: {
  icon: typeof Clock;
  label: string;
  muted?: boolean;
  wrap?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p
        className={`flex ${wrap ? 'items-start' : 'items-center'} gap-1.5 text-sm ${
          muted ? 'text-gray-400' : 'text-gray-800'
        }`}
      >
        <Icon className={`w-3.5 h-3.5 text-gray-400 shrink-0 ${wrap ? 'mt-0.5' : ''}`} />
        <span className={wrap ? 'break-words min-w-0' : 'truncate'}>{children}</span>
      </p>
    </div>
  );
}

const INLINE_ACTION_BTN =
  'inline-flex items-center justify-center p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0';

/** Full-width row card used in the tour list. */
export default function TourCard({
  tour,
  onEdit,
  onDelete,
}: {
  tour: TourDate;
  onEdit: (tour: TourDate) => void;
  onDelete: (tour: TourDate) => void;
}) {
  const phone = tour.lead?.phone?.replace(/\D/g, '');
  const email = tour.lead?.email;
  const pdfUrl = tour.lead?.proposal?.pdf_url;
  const d = parseISODate(tour.date);
  const day = tour.date.slice(8, 10);
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Edit / delete pinned to the top-right corner */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5">
        <button
          onClick={() => onEdit(tour)}
          className="p-1 rounded-md text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          title="Editar"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(tour)}
          className="p-1 rounded-md text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Remover"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:pr-10">
        {/* Date + time */}
        <div className="flex lg:flex-col items-baseline lg:items-center gap-2 lg:gap-0.5 lg:w-14 shrink-0">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {WEEKDAY_SHORT_PT[d.getDay()]}
          </span>
          <span className="text-2xl font-bold text-gray-900 leading-none">{day}</span>
          <span
            className={`flex items-center gap-1 text-xs font-medium lg:mt-1 ${
              tour.start_time ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            <Clock className="w-3 h-3 shrink-0" />
            {formatTime(tour.start_time) ?? '—'}
          </span>
        </div>

        <div className="hidden lg:block w-px self-stretch bg-gray-100 shrink-0" />

        {/* Client + contact actions + tour + status */}
        <div className="lg:w-52 xl:w-64 shrink-0 min-w-0">
          <div className="flex items-center gap-0.5 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate mr-1">{tour.lead?.name ?? '—'}</p>
            {phone && (
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className={INLINE_ACTION_BTN}
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} title="E-mail" className={INLINE_ACTION_BTN}>
                <Mail className="w-3.5 h-3.5" />
              </a>
            )}
            <Link href={`/admin/crm?lead=${tour.lead_id}`} title="Ver no CRM" className={INLINE_ACTION_BTN}>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Proposta em PDF"
                className={INLINE_ACTION_BTN}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate mt-0.5">{tour.tour_name}</p>
          <div className="mt-1.5">
            <StatusBadge status={tour.status} />
          </div>
        </div>

        {/* Tour details in aligned columns */}
        <div className="flex-1 min-w-0 grid grid-cols-2 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-x-5 gap-y-2.5">
          <InfoItem icon={Users} label="Pessoas" muted={tour.pax == null}>
            {tour.pax ?? 'A confirmar'}
          </InfoItem>
          <InfoItem icon={MapPin} label="Encontro" muted={tour.meeting_point == null} wrap>
            {tour.meeting_point ?? 'A confirmar'}
          </InfoItem>
          <InfoItem icon={Wallet} label="Valor" muted={tour.agreed_price == null}>
            {tour.agreed_price != null ? `${tour.agreed_price} €` : 'A definir'}
            {tour.anzahlung_paid ? (
              <span title="Anzahlung pago" className="inline-flex ml-1.5 align-middle">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              </span>
            ) : (
              <span title="Anzahlung pendente" className="inline-flex ml-1.5 align-middle">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </span>
            )}
          </InfoItem>
        </div>

      </div>

      {tour.notes && (
        <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 italic">{tour.notes}</p>
      )}
    </div>
  );
}
