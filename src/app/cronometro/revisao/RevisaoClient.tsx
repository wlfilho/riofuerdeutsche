'use client';

/**
 * Revisão do dia: corrigir horário e rebaixar registro duvidoso.
 *
 * Nada aqui apaga. Um registro ruim vira `reliable = false` e continua no
 * banco: saber que uma medição existiu e não presta é informação, e apagar
 * deixaria o dia com um buraco que ninguém sabe explicar depois.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pareceConfiavel } from '@/lib/cronometro/rules';
import type { RegistroMedido } from '@/lib/cronometro/server';
import type { Place, SegmentKind } from '@/lib/cronometro/types';

function duracaoLonga(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h === 0) return `${m}min`;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** ISO → "HH:MM" no fuso do Rio, que é o que o <input type="time"> espera. */
function paraHoraLocal(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** "HH:MM" digitado + o dia do registro → instante ISO, no fuso do Rio. */
function paraISO(dia: string, hhmm: string, diasDepois = 0): string {
  const base = new Date(`${dia}T${hhmm}:00-03:00`);
  if (diasDepois !== 0) base.setDate(base.getDate() + diasDepois);
  return base.toISOString();
}

/**
 * Um tour by-night que sai às 21h e termina 00:30 tem fim ANTES do início no
 * relógio, mas no dia seguinte no calendário. Sem isto, corrigir o horário de
 * um segmento desses seria recusado pelo servidor (ended_at < started_at) — e
 * justamente os tours noturnos são os que mais interessa medir, porque o
 * trânsito da madrugada é onde o fator de 1,0 foi chutado.
 */
function fimNoDiaCerto(dia: string, inicio: string, fim: string): string {
  const cruzaMeiaNoite = fim < inicio;
  return paraISO(dia, fim, cruzaMeiaNoite ? 1 : 0);
}

function rotulo(r: RegistroMedido): string {
  if (r.segment_kind === 'visit') {
    return r.to_nome ?? r.place_label ?? 'Visita sem lugar identificado';
  }
  const de = r.from_nome ?? 'origem não identificada';
  const para = r.to_nome ?? r.place_label ?? 'destino não identificado';
  return `${de} → ${para}`;
}

export default function RevisaoClient({
  registros,
  paradas,
  dia,
}: {
  registros: RegistroMedido[];
  paradas: Place[];
  dia: string;
}) {
  const router = useRouter();
  const [linhas, setLinhas] = useState(registros);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = () => router.refresh();

  const salvar = async (
    r: RegistroMedido,
    patch: {
      inicio?: string;
      fim?: string;
      rebaixar?: boolean;
      promover?: boolean;
      lugar?: { serviceId: string | null; label: string | null };
    },
  ) => {
    setSalvando(r.id);
    setErro(null);

    const corpo: Record<string, unknown> = { id: r.id };
    // Os dois horários andam juntos: decidir se o fim caiu no dia seguinte
    // exige conhecer o início, mesmo quando só um dos dois foi editado.
    const inicioHHMM = patch.inicio ?? paraHoraLocal(r.started_at);
    const fimHHMM = patch.fim ?? paraHoraLocal(r.ended_at);
    if (patch.inicio || patch.fim) {
      corpo.started_at = paraISO(dia, inicioHHMM);
      corpo.ended_at = fimNoDiaCerto(dia, inicioHHMM, fimHHMM);
    }
    if (patch.rebaixar) corpo.reliable = false;
    if (patch.promover) corpo.reliable = true;
    if (patch.lugar) {
      corpo.to_service_id = patch.lugar.serviceId;
      corpo.place_label = patch.lugar.label;
    }

    try {
      const res = await fetch('/api/cronometro/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErro(data.error ?? `HTTP ${res.status}`);
        return;
      }
      const started = (corpo.started_at as string) ?? r.started_at;
      const ended = (corpo.ended_at as string) ?? r.ended_at;
      const duracao = Math.max(0, Math.round((Date.parse(ended) - Date.parse(started)) / 1000));
      setLinhas(prev =>
        prev.map(l =>
          l.id === r.id
            ? {
                ...l,
                started_at: started,
                ended_at: ended,
                duration_seconds: duracao,
                // Mesma conta que o servidor acabou de fazer: corrigir um
                // horário absurdo devolve a confiança, e a tela precisa dizer
                // isso, senão o registro fica marcado como duvidoso aqui e
                // confiável no banco.
                reliable: patch.rebaixar
                  ? false
                  : pareceConfiavel(l.segment_kind, duracao) &&
                    (patch.promover ? true : l.reliable),
                ...(patch.lugar
                  ? {
                      to_service_id: patch.lugar.serviceId,
                      to_nome: patch.lugar.serviceId
                        ? paradas.find(p => p.id === patch.lugar!.serviceId)?.name ?? null
                        : null,
                      place_label: patch.lugar.label,
                    }
                  : {}),
              }
            : l,
        ),
      );
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setSalvando(null);
    }
  };

  const dividir = async (r: RegistroMedido, hhmm: string, primeiro: SegmentKind, segundo: SegmentKind) => {
    setSalvando(r.id);
    setErro(null);
    try {
      const res = await fetch('/api/cronometro/dividir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: r.id,
          at: fimNoDiaCerto(dia, paraHoraLocal(r.started_at), hhmm),
          first_kind: primeiro,
          second_kind: segundo,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setErro(data.error ?? `HTTP ${res.status}`);
        return;
      }
      // Dividir cria uma linha nova no servidor; recarregar é mais simples e
      // mais seguro que tentar reconstruir a lista aqui.
      recarregar();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setSalvando(null);
    }
  };

  if (linhas.length === 0) {
    return <p className="mt-8 text-sm text-slate-400">Nenhuma medição neste dia.</p>;
  }

  return (
    <>
      {erro && (
        <p className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">{erro}</p>
      )}
      <div className="mt-5 space-y-3">
        {linhas.map(r => (
          <Linha
            key={r.id}
            registro={r}
            salvando={salvando === r.id}
            onSalvar={patch => void salvar(r, patch)}
            onDividir={(hhmm, a, b) => void dividir(r, hhmm, a, b)}
            paradas={paradas}
          />
        ))}
      </div>
    </>
  );
}

function Linha({
  registro,
  paradas,
  salvando,
  onSalvar,
  onDividir,
}: {
  registro: RegistroMedido;
  paradas: Place[];
  salvando: boolean;
  onSalvar: (patch: {
    inicio?: string;
    fim?: string;
    rebaixar?: boolean;
    promover?: boolean;
    lugar?: { serviceId: string | null; label: string | null };
  }) => void;
  onDividir: (hhmm: string, primeiro: SegmentKind, segundo: SegmentKind) => void;
}) {
  const [inicio, setInicio] = useState(() => paraHoraLocal(registro.started_at));
  const [fim, setFim] = useState(() => paraHoraLocal(registro.ended_at));
  const [editandoLugar, setEditandoLugar] = useState(false);
  const [digitado, setDigitado] = useState(registro.place_label ?? '');
  const [abrindoDivisao, setAbrindoDivisao] = useState(false);
  // O corte começa no meio do bloco: é um ponto de partida neutro, e o valor
  // certo quase sempre está mais perto do meio do que de qualquer borda.
  const [corte, setCorte] = useState(() =>
    paraHoraLocal(new Date((Date.parse(registro.started_at) + Date.parse(registro.ended_at)) / 2).toISOString()),
  );
  const [primeiro, setPrimeiro] = useState<SegmentKind>(registro.segment_kind);
  const [segundo, setSegundo] = useState<SegmentKind>(
    registro.segment_kind === 'travel' ? 'visit' : 'visit',
  );

  const mudou =
    inicio !== paraHoraLocal(registro.started_at) || fim !== paraHoraLocal(registro.ended_at);

  return (
    <div
      className={`rounded-xl border p-4 ${
        registro.reliable ? 'border-slate-700 bg-slate-800' : 'border-amber-600/50 bg-amber-950/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {registro.segment_kind === 'travel' ? 'Deslocamento' : 'Visita'}
          </p>
          <p className="mt-0.5 truncate font-medium">{rotulo(registro)}</p>
        </div>
        <p className="shrink-0 font-mono tabular-nums text-slate-300">
          {duracaoLonga(registro.duration_seconds)}
        </p>
      </div>

      {!registro.reliable && (
        <p className="mt-2 text-xs text-amber-400">
          Marcado como não confiável. Fica no banco, fora das médias.
        </p>
      )}

      {/* ── Lugar ───────────────────────────────────────────────────────── */}
      {!editandoLugar ? (
        <button
          onClick={() => setEditandoLugar(true)}
          className="mt-2 text-xs text-slate-400 underline-offset-4 hover:underline"
        >
          Trocar o lugar
        </button>
      ) : (
        <div className="mt-3 space-y-2 rounded-lg bg-slate-900/50 p-3">
          <select
            value={registro.to_service_id ?? ''}
            onChange={e => {
              onSalvar({ lugar: { serviceId: e.target.value || null, label: null } });
              setEditandoLugar(false);
            }}
            className="w-full rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100"
          >
            <option value="">— nenhuma parada do catálogo —</option>
            {[...paradas]
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>

          <div className="flex gap-2">
            <input
              value={digitado}
              onChange={e => setDigitado(e.target.value)}
              placeholder="Ou escreva um nome livre"
              className="min-w-0 flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <button
              onClick={() => {
                onSalvar({ lugar: { serviceId: null, label: digitado.trim() || null } });
                setEditandoLugar(false);
              }}
              disabled={salvando}
              className="rounded-lg bg-slate-600 px-3 py-2 text-sm disabled:opacity-40"
            >
              Usar
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            Escolher do catálogo é o que liga o registro à tela de comparação. Nome livre serve
            para lugar que não existe no catálogo, e fica de fora da comparação.
          </p>

          <button onClick={() => setEditandoLugar(false)} className="text-xs text-slate-400">
            Cancelar
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <input
          type="time"
          value={inicio}
          onChange={e => e.target.value && setInicio(e.target.value)}
          className="rounded-lg bg-slate-700 px-2 py-1.5 tabular-nums text-slate-100"
        />
        <span className="text-slate-500">–</span>
        <input
          type="time"
          value={fim}
          onChange={e => e.target.value && setFim(e.target.value)}
          className="rounded-lg bg-slate-700 px-2 py-1.5 tabular-nums text-slate-100"
        />

        <button
          onClick={() => onSalvar({ inicio, fim })}
          disabled={!mudou || salvando}
          className="rounded-lg bg-emerald-500 px-3 py-1.5 font-medium text-white disabled:opacity-40"
        >
          {salvando ? 'Salvando…' : 'Corrigir'}
        </button>

        {registro.reliable ? (
          <button
            onClick={() => onSalvar({ rebaixar: true })}
            disabled={salvando}
            className="rounded-lg border border-amber-600/60 px-3 py-1.5 text-amber-300 disabled:opacity-40"
          >
            Não confiável
          </button>
        ) : (
          <button
            onClick={() => onSalvar({ promover: true })}
            disabled={salvando}
            className="rounded-lg border border-emerald-600/60 px-3 py-1.5 text-emerald-300 disabled:opacity-40"
          >
            Confiável
          </button>
        )}

        <button
          onClick={() => setAbrindoDivisao(v => !v)}
          disabled={salvando}
          className="rounded-lg border border-slate-600 px-3 py-1.5 text-slate-300 disabled:opacity-40"
        >
          Dividir
        </button>
      </div>

      {/* ── Divisão ─────────────────────────────────────────────────────── */}
      {abrindoDivisao && (
        <div className="mt-3 space-y-3 rounded-lg bg-slate-900/50 p-3">
          <p className="text-xs text-slate-400">
            Um bloco que contém duas coisas — por exemplo o deslocamento que engoliu a visita
            porque a chegada não foi marcada, ou a fila de ingresso somada à visita.
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-400">Cortar às</span>
            <input
              type="time"
              value={corte}
              onChange={e => e.target.value && setCorte(e.target.value)}
              className="rounded-lg bg-slate-700 px-2 py-1.5 tabular-nums text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <select
              value={primeiro}
              onChange={e => setPrimeiro(e.target.value as SegmentKind)}
              className="rounded-lg bg-slate-700 px-2 py-1.5 text-slate-100"
            >
              <option value="travel">Deslocamento</option>
              <option value="visit">Visita</option>
            </select>
            <span className="text-slate-500">depois</span>
            <select
              value={segundo}
              onChange={e => setSegundo(e.target.value as SegmentKind)}
              className="rounded-lg bg-slate-700 px-2 py-1.5 text-slate-100"
            >
              <option value="travel">Deslocamento</option>
              <option value="visit">Visita</option>
            </select>
          </div>

          <p className="text-[11px] text-slate-500">
            As duas metades nascem como não confiáveis, porque a hora do corte é lembrança e não
            medição. Se o corte for firme (o horário impresso num ingresso, por exemplo), marque
            como confiável depois.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onDividir(corte, primeiro, segundo);
                setAbrindoDivisao(false);
              }}
              disabled={salvando}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 font-medium text-white disabled:opacity-40"
            >
              Dividir aqui
            </button>
            <button onClick={() => setAbrindoDivisao(false)} className="text-sm text-slate-400">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
