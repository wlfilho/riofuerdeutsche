/**
 * Medido contra previsto, segmento a segmento.
 *
 * O número que mais interessa é o "fator observado" dos deslocamentos: medido
 * dividido pelo tempo cru do ORS. É literalmente o fator que teria acertado
 * aquele trecho naquele horário, e é com ele na mão que a tabela de faixas em
 * /admin/configuracoes se calibra.
 *
 * Esta tela não ajusta nada sozinha, de propósito. Poucas medições viram média
 * ruim com facilidade, e uma média ruim aplicada automaticamente é pior que
 * estimativa nenhuma: parece medida.
 */
import Link from 'next/link';
import { BOTAO_NAV, chipDia } from '../toque';
import { getComparacao, getDiasComRegistro, hojeNoRio } from '@/lib/cronometro/server';

export const dynamic = 'force-dynamic';

function dur(s: number | null): string {
  if (s === null) return '—';
  const min = Math.round(s / 60);
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

function razaoTexto(r: number | null): string {
  return r === null ? '—' : `${r.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×`;
}

/** Verde = previsão bateu; âmbar = errou para menos; azul = errou para mais. */
function corRazao(r: number | null): string {
  if (r === null) return 'text-slate-500';
  if (r > 1.15) return 'text-amber-400';
  if (r < 0.85) return 'text-sky-400';
  return 'text-emerald-400';
}

export default async function ComparacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const dias = await getDiasComRegistro();
  const alvo = dia ?? dias[0] ?? hojeNoRio();
  const linhas = await getComparacao(alvo);

  const deslocamentos = linhas.filter(l => l.segment_kind === 'travel' && l.reliable && l.fator_observado !== null);
  // Mediana, não média: um trecho que pegou acidente joga a média para longe,
  // e são poucas medições para uma média aguentar isso.
  const observados = deslocamentos.map(d => d.fator_observado!).sort((a, b) => a - b);
  const medianaFator = observados.length > 0
    ? observados[Math.floor(observados.length / 2)]
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Medido × previsto</h1>
        <Link href="/cronometro" className={`shrink-0 ${BOTAO_NAV}`}>
          Voltar
        </Link>
      </div>

      {dias.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {dias.slice(0, 10).map(d => (
            <Link
              key={d}
              href={`/cronometro/comparacao?dia=${d}`}
              className={chipDia(d === alvo)}
            >
              {d.split('-').reverse().slice(0, 2).join('/')}
            </Link>
          ))}
        </div>
      )}

      {medianaFator !== null && (
        <div className="mt-5 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-sm text-slate-400">
            Fator observado neste dia, mediana de {observados.length} deslocamento
            {observados.length === 1 ? '' : 's'} confiável{observados.length === 1 ? '' : 'is'}
          </p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {medianaFator.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Quanto o tempo real ficou acima do cálculo cru do OpenRouteService. Compare com as
            faixas em Configurações. Nada muda sozinho: a decisão é sua.
          </p>
        </div>
      )}

      {linhas.length === 0 ? (
        <p className="mt-8 text-sm text-slate-400">Nenhuma medição neste dia.</p>
      ) : (
        <div className="mt-5 space-y-2">
          {linhas.map(l => (
            <div
              key={l.id}
              className={`rounded-xl border p-4 ${
                l.reliable ? 'border-slate-700 bg-slate-800' : 'border-amber-600/40 bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {l.segment_kind === 'travel' ? 'Deslocamento' : 'Visita'}
                    {!l.reliable && ' · não confiável'}
                  </p>
                  <p className="mt-0.5 truncate font-medium">
                    {l.segment_kind === 'visit'
                      ? l.to_nome ?? l.place_label ?? 'Lugar não identificado'
                      : `${l.from_nome ?? '?'} → ${l.to_nome ?? l.place_label ?? '?'}`}
                  </p>
                </div>
                <p className={`shrink-0 font-mono text-lg tabular-nums ${corRazao(l.razao)}`}>
                  {razaoTexto(l.razao)}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Medido</p>
                  <p className="tabular-nums text-slate-100">{dur(l.duration_seconds)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Previsto</p>
                  <p className="tabular-nums text-slate-300">{dur(l.previsto_s)}</p>
                </div>
                {l.segment_kind === 'travel' && (
                  <div>
                    <p className="text-xs text-slate-500">
                      ORS cru{l.fator !== null ? ` · ×${l.fator.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}` : ''}
                    </p>
                    <p className="tabular-nums text-slate-300">
                      {dur(l.base_s)}
                      {l.fator_observado !== null && (
                        <span className="ml-1 text-xs text-slate-500">
                          (real {l.fator_observado.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
