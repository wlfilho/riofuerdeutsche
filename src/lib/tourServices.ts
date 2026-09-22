import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

/**
 * Duração das atrações, lida do catálogo do gerador de propostas.
 *
 * O catálogo (proposal_services) é a fonte de verdade: é com ele que o Will
 * monta e precifica de verdade. As páginas públicas liam duração escrita à
 * mão e divergiam em silêncio (8 de 12 etiquetas erradas em /touren/klassiker
 * quando isto foi escrito, em 19/09/2026).
 *
 * A tabela é admin-only no RLS, então o acesso público passa pela view
 * public_tour_services, que expõe só slug, nome e tempos. Preço não passa por
 * ela: mora em proposal_service_costs, fora da view de propósito.
 */

export type TourServiceDuration = {
  slug: string
  name: string
  durationHours: number
  transferHoursTo: number
  transferHoursBack: number
}

export const getTourServiceDurations = cache(
  async (): Promise<Map<string, TourServiceDuration>> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('public_tour_services')
      .select('slug, name, duration_hours, transfer_hours_to, transfer_hours_back')

    if (error) {
      console.error('[getTourServiceDurations] falhou:', error.message)
      return new Map()
    }

    return new Map(
      (data ?? []).map((row) => [
        row.slug as string,
        {
          slug: row.slug as string,
          name: row.name as string,
          durationHours: Number(row.duration_hours),
          transferHoursTo: Number(row.transfer_hours_to ?? 0),
          transferHoursBack: Number(row.transfer_hours_back ?? 0),
        },
      ])
    )
  }
)

/**
 * Formata a duração para a etiqueta em alemão, arredondando aos 5 minutos.
 * 0.25 → "~15 Min." · 1 → "~1 Std." · 1.5 → "~1,5 Std." · 1.25 → "~1 Std. 15 Min."
 */
export function formatDuration(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return ''

  const totalMinutes = Math.round((hours * 60) / 5) * 5
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60

  if (h === 0) return `~${m} Min.`
  if (m === 0) return `~${h} Std.`
  if (m === 30) return `~${h},5 Std.`
  return `~${h} Std. ${m} Min.`
}
