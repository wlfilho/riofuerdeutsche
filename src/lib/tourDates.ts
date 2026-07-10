// Shared types for tour_dates (calendário de tours)

export type TourDateStatus = 'proposta_enviada' | 'fechado';

export const TOUR_DATE_STATUS_LABELS: Record<TourDateStatus, string> = {
  fechado: 'FECHADO',
  proposta_enviada: 'PROPOSTA ENVIADA',
};

export interface TourDateLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  proposal: { id: string; pdf_url: string | null } | null;
}

export interface TourDate {
  id: string;
  lead_id: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  tour_name: string;
  status: TourDateStatus;
  pax: number | null;
  meeting_point: string | null;
  agreed_price: number | null;
  anzahlung_paid: boolean;
  notes: string | null;
  created_at: string;
  lead: TourDateLead | null;
}

export interface TourDateInput {
  lead_id: string;
  date: string;
  start_time: string | null;
  tour_name: string;
  status: TourDateStatus;
  pax: number | null;
  meeting_point: string | null;
  agreed_price: number | null;
  anzahlung_paid: boolean;
  notes: string | null;
}

export const TOUR_DATE_SELECT = '*, lead:price_leads(id, name, email, phone, proposal:proposals(id, pdf_url))';
