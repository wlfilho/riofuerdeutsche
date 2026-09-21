'use client';

/**
 * Revisão do dia: corrigir horário e rebaixar registro duvidoso.
 *
 * Nada aqui apaga. Um registro ruim vira `reliable = false` e continua no
 * banco: saber que uma medição existiu e não presta é informação, e apagar
 * deixaria o dia com um buraco que ninguém sabe explicar depois.
 *
 * Esta era a tela com os piores alvos do cronômetro: cinco controles de 32 px
 * embolados numa `flex-wrap`, mais dois links de texto de 16 px. Revisar não
 * acontece na rua, mas acontece no celular, à noite, cansado, e errar o botão
 * aqui não é só irritante: o toque vizinho de "Corrigir" era "Não confiável",
 * que muda o dado. Agora cada controle tem 48 px, os campos têm 16 px de fonte
 * (abaixo disso o Safari do iPhone dá zoom sozinho ao focar) e as ações estão
 * separadas por fileira, em vez de disputarem a mesma linha.
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pareceConfiavel } from '@/lib/cronometro/rules';
import {
  BOTAO_ATENCAO,
  BOTAO_OK,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
} from '../toque';
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
    return <p className="mt-8 text-base text-slate-400">Nenhuma medição neste dia.</p>;
  }

  return (
    <>
      {erro && (
        <p className="mt-4 rounded-xl bg-red-500/15 px-4 py-3 text-base text-red-300">{erro}</p>
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
          <p className="text-sm uppercase tracking-wide text-slate-400">
            {registro.segment_kind === 'travel' ? 'Deslocamento' : 'Visita'}
          </p>
          <p className="mt-1 truncate text-base font-medium">{rotulo(registro)}</p>
        </div>
        <p className="shrink-0 font-mono text-lg tabular-nums text-slate-200">
          {duracaoLonga(registro.duration_seconds)}
        </p>
      </div>

      {!registro.reliable && (
        <p className="mt-2 text-sm text-amber-400">
          Marcado como não confiável. Fica no banco, fora das médias.
        </p>
      )}

      {/* ── Lugar ───────────────────────────────────────────────────────── */}
      {!editandoLugar ? (
        <button
          onClick={() => setEditandoLugar(true)}
          className={`mt-3 w-full ${BOTAO_SECUNDARIO}`}
        >
          Trocar o lugar
        </button>
      ) : (
        <div className="mt-3 space-y-3 rounded-xl bg-slate-900/50 p-3">
          <select
            value={registro.to_service_id ?? ''}
            onChange={e => {
              onSalvar({ lugar: { serviceId: e.target.value || null, label: null } });
              setEditandoLugar(false);
            }}
            className={CAMPO}
          >
            <option value="">nenhuma parada do catálogo</option>
            {[...paradas]
              .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
          </select>

          {/* Campo e botão empilhados: lado a lado, o "Usar" comia a largura do
              campo e sobravam dois alvos apertados na tela de 375 px. */}
          <input
            value={digitado}
            onChange={e => setDigitado(e.target.value)}
            placeholder="Ou escreva um nome livre"
            className={CAMPO}
          />
          <button
            onClick={() => {
              onSalvar({ lugar: { serviceId: null, label: digitado.trim() || null } });
              setEditandoLugar(false);
            }}
            disabled={salvando}
            className={`w-full ${BOTAO_SECUNDARIO}`}
          >
            Usar este nome
          </button>

          <p className="text-sm text-slate-400">
            Escolher do catálogo é o que liga o registro à tela de comparação. Nome livre serve
            para lugar que não existe no catálogo, e fica de fora da comparação.
          </p>

          <button
            onClick={() => setEditandoLugar(false)}
            className={`w-full ${BOTAO_SECUNDARIO}`}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Os horários em fileira própria, cada campo com metade da largura. O
          traço é intervalo (`von–bis`), não aposto. */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="time"
          value={inicio}
          onChange={e => e.target.value && setInicio(e.target.value)}
          className={`${CAMPO} flex-1 tabular-nums`}
          aria-label="Início"
        />
        <span className="shrink-0 text-slate-400">–</span>
        <input
          type="time"
          value={fim}
          onChange={e => e.target.value && setFim(e.target.value)}
          className={`${CAMPO} flex-1 tabular-nums`}
          aria-label="Fim"
        />
      </div>

      {/* Aparece só depois de mexer no horário. Em fileira própria, e não ao
          lado de "Não confiável" como antes: acertar o botão errado ali muda o
          dado em vez de salvar a hora. */}
      {mudou && (
        <button
          onClick={() => onSalvar({ inicio, fim })}
          disabled={salvando}
          className={`mt-2 w-full ${BOTAO_PRIMARIO}`}
        >
          {salvando ? 'Salvando…' : 'Corrigir o horário'}
        </button>
      )}

      <div className="mt-2 grid grid-cols-2 gap-2">
        {registro.reliable ? (
          <button
            onClick={() => onSalvar({ rebaixar: true })}
            disabled={salvando}
            className={BOTAO_ATENCAO}
          >
            Não confiável
          </button>
        ) : (
          <button
            onClick={() => onSalvar({ promover: true })}
            disabled={salvando}
            className={BOTAO_OK}
          >
            Confiável
          </button>
        )}

        <button
          onClick={() => setAbrindoDivisao(v => !v)}
          disabled={salvando}
          className={BOTAO_SECUNDARIO}
        >
          {abrindoDivisao ? 'Fechar' : 'Dividir'}
        </button>
      </div>

      {/* ── Divisão ─────────────────────────────────────────────────────── */}
      {abrindoDivisao && (
        <div className="mt-2 space-y-3 rounded-xl bg-slate-900/50 p-3">
          <p className="text-sm text-slate-300">
            Um bloco que contém duas coisas — por exemplo o deslocamento que engoliu a visita
            porque a chegada não foi marcada, ou a fila de ingresso somada à visita.
          </p>

          <label className="block">
            <span className="text-sm text-slate-400">Cortar às</span>
            <input
              type="time"
              value={corte}
              onChange={e => e.target.value && setCorte(e.target.value)}
              className={`mt-1 ${CAMPO} tabular-nums`}
            />
          </label>

          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-slate-400">Primeira metade</span>
              <select
                value={primeiro}
                onChange={e => setPrimeiro(e.target.value as SegmentKind)}
                className={`mt-1 ${CAMPO}`}
              >
                <option value="travel">Deslocamento</option>
                <option value="visit">Visita</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-400">Segunda metade</span>
              <select
                value={segundo}
                onChange={e => setSegundo(e.target.value as SegmentKind)}
                className={`mt-1 ${CAMPO}`}
              >
                <option value="travel">Deslocamento</option>
                <option value="visit">Visita</option>
              </select>
            </label>
          </div>

          <p className="text-sm text-slate-400">
            As duas metades nascem como não confiáveis, porque a hora do corte é lembrança e não
            medição. Se o corte for firme (o horário impresso num ingresso, por exemplo), marque
            como confiável depois.
          </p>

          <button
            onClick={() => {
              onDividir(corte, primeiro, segundo);
              setAbrindoDivisao(false);
            }}
            disabled={salvando}
            className={`w-full ${BOTAO_PRIMARIO}`}
          >
            Dividir aqui
          </button>
          <button
            onClick={() => setAbrindoDivisao(false)}
            className={`w-full ${BOTAO_SECUNDARIO}`}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
