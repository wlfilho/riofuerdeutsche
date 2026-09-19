'use client';

/**
 * A tela do cronômetro: um botão que ocupa quase tudo.
 *
 * Um botão é regra de projeto, não simplificação de primeira versão. Isto é
 * usado andando, no sol, com cliente ao lado esperando resposta sobre outra
 * coisa. Qualquer tela que peça uma segunda decisão no momento do toque não
 * sobrevive a um dia de trabalho, e medição que não é feita não existe.
 *
 * Tudo o que exige decisão (qual lugar era aquele, qual tour é o de hoje) ou
 * aparece ANTES do tour começar, ou DEPOIS do toque, nunca no meio.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCronometro, type Fase } from '@/lib/cronometro/useCronometro';
import { RAIO_MATCH_M } from '@/lib/cronometro/rules';
import type { Place } from '@/lib/cronometro/types';
import type { TourDoDia } from '@/lib/cronometro/server';

const ROTULO: Record<Exclude<Fase, 'carregando'>, string> = {
  parado: 'Sair',
  travel: 'Cheguei',
  visit: 'Saindo',
};

const LEGENDA: Record<Exclude<Fase, 'carregando'>, string> = {
  parado: 'Toque ao começar a se deslocar',
  travel: 'Em deslocamento',
  visit: 'Em visita',
};

const COR: Record<Exclude<Fase, 'carregando'>, string> = {
  parado: 'bg-emerald-500 active:bg-emerald-600',
  travel: 'bg-sky-500 active:bg-sky-600',
  visit: 'bg-amber-500 active:bg-amber-600',
};

/** "1h04" / "12min" / "42s" — legível de relance, sem precisar focar. */
function duracaoCurta(segundos: number): string {
  if (segundos < 60) return `${segundos}s`;
  const min = Math.floor(segundos / 60);
  if (min < 60) return `${min}min`;
  return `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;
}

function horaCurta(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function CronometroApp({
  hoje,
  tours,
  paradas,
}: {
  hoje: string;
  tours: TourDoDia[];
  paradas: Place[];
}) {
  const {
    fase, estado, paradas: catalogo, pergunta, naFila, online, gpsPronto,
    tocar, encerrarDia, responderLugar, escolherTour, descartarPergunta,
  } = useCronometro(paradas);

  // Cronômetro visual do segmento aberto. Só um contador de tela: o dado que
  // vale é started_at, já gravado.
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Registra o service worker só aqui: o /sw.js da raiz é auto-destrutivo de
  // propósito, e este escopo não pode encostar nele.
  //
  // Fora do dev: o worker guarda /_next/static/ com cache-first, que é correto
  // em produção (nome com hash, conteúdo imutável) e uma armadilha no dev, onde
  // o nome do chunk é estável e o conteúdo muda a cada salvamento — o app
  // passaria a rodar código velho sem nenhum sinal. Para exercitar o offline
  // localmente, usar `npm run build && npm start`.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'development') return;
    navigator.serviceWorker
      .register('/cronometro-sw.js', { scope: '/cronometro' })
      .catch(err => console.error('[cronometro] service worker não registrou:', err));
  }, []);

  const precisaEscolherTour = tours.length > 1 && !estado.tourDateId;
  const tourAtual = tours.find(t => t.id === estado.tourDateId) ?? null;

  // Um tour só no dia: não há o que perguntar.
  //
  // Espera a retomada terminar antes de gravar qualquer coisa: enquanto
  // `carregando`, o estado ainda não é o que está em disco, e escrever ali em
  // cima já apagou segmento em andamento uma vez.
  const jaEscolheuSozinho = useRef(false);
  useEffect(() => {
    if (fase === 'carregando') return;
    if (tours.length === 1 && !estado.tourDateId && !jaEscolheuSozinho.current) {
      jaEscolheuSozinho.current = true;
      void escolherTour(tours[0].id);
    }
  }, [fase, tours, estado.tourDateId, escolherTour]);

  if (fase === 'carregando') {
    return <div className="grid min-h-[100dvh] place-items-center text-slate-400">Carregando…</div>;
  }

  if (precisaEscolherTour) {
    return (
      <div className="min-h-[100dvh] px-5 py-10" style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
        <h1 className="text-xl font-semibold">Qual tour é este?</h1>
        <p className="mt-1 text-sm text-slate-400">
          Há {tours.length} tours em {hoje.split('-').reverse().join('/')}.
        </p>
        <div className="mt-6 space-y-3">
          {tours.map(t => (
            <button
              key={t.id}
              onClick={() => void escolherTour(t.id)}
              className="w-full rounded-2xl bg-slate-800 px-5 py-4 text-left active:bg-slate-700"
            >
              <p className="font-medium">{t.tour_name ?? 'Tour sem nome'}</p>
              <p className="mt-0.5 text-sm text-slate-400">
                {[t.start_time?.slice(0, 5), t.cliente, t.pax ? `${t.pax} pax` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const aberto = estado.open;
  const corridos = aberto ? Math.max(0, Math.round((agora - Date.parse(aberto.started_at)) / 1000)) : 0;

  return (
    <div
      className="flex min-h-[100dvh] flex-col px-5"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      {/* Cabeçalho: só o que dá contexto de relance. */}
      <header className="flex items-start justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-300">
            {tourAtual?.tour_name ?? (tours.length === 0 ? 'Sem tour na agenda de hoje' : 'Tour de hoje')}
          </p>
          <p className="truncate text-xs text-slate-500">
            {estado.lastPlaceLabel ? `Último lugar: ${estado.lastPlaceLabel}` : 'Lugar ainda não identificado'}
          </p>
        </div>
        <div className="shrink-0 text-right text-xs">
          <p className={online ? 'text-slate-500' : 'text-amber-400'}>
            {online ? 'on-line' : 'sem rede'}
          </p>
          {/* Sem dados móveis o GPS leva até um minuto para achar satélite.
              Saber disso ANTES de tocar evita marcar um lugar sem coordenada
              sem perceber, que foi o que esvaziou o primeiro dia de medição. */}
          <p className={gpsPronto ? 'text-emerald-400' : 'text-slate-500'}>
            {gpsPronto ? 'GPS pronto' : 'GPS procurando'}
          </p>
          {naFila > 0 && <p className="text-slate-500">{naFila} na fila</p>}
        </div>
      </header>

      {/* O botão. Ocupa o resto da tela de propósito: é impossível errar o
          alvo andando, e não há um segundo alvo para errar. */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 py-4">
        <div className="text-center">
          <p className="text-sm text-slate-400">{LEGENDA[fase]}</p>
          {aberto && (
            <p className="mt-1 font-mono text-4xl tabular-nums text-slate-100">
              {duracaoCurta(corridos)}
            </p>
          )}
          {aberto && (
            <p className="mt-0.5 text-xs text-slate-500">desde {horaCurta(aberto.started_at)}</p>
          )}
        </div>

        <button
          onClick={() => void tocar()}
          className={`aspect-square w-full max-w-[22rem] rounded-full text-5xl font-semibold text-white shadow-2xl transition-colors ${COR[fase]}`}
        >
          {ROTULO[fase]}
        </button>
      </main>

      {/* Ações secundárias: discretas de propósito, longe do alvo principal. */}
      <footer className="flex items-center justify-between py-3 text-sm">
        <div className="flex gap-4">
          <Link href="/cronometro/revisao" className="text-slate-400 underline-offset-4 hover:underline">
            Revisão
          </Link>
          <Link href="/cronometro/comparacao" className="text-slate-400 underline-offset-4 hover:underline">
            Comparação
          </Link>
        </div>
        {aberto && (
          <button onClick={() => void encerrarDia()} className="text-slate-400 underline-offset-4 hover:underline">
            Encerrar o dia
          </button>
        )}
      </footer>

      {pergunta && (
        <EscolhaLugar
          candidatas={pergunta.match.candidatas}
          catalogo={catalogo}
          motivo={pergunta.match.motivo}
          onEscolher={escolha => void responderLugar(pergunta.segmento, escolha)}
          onDescartar={descartarPergunta}
        />
      )}
    </div>
  );
}

const MOTIVO_TEXTO: Record<string, string> = {
  'gps-impreciso': `O GPS está impreciso demais para identificar sozinho (erro acima de 100 m).`,
  'nada-por-perto': `Nenhuma parada do catálogo a menos de ${RAIO_MATCH_M} m.`,
  // Sem rede o GPS pode levar até um minuto para achar satélite. Escolher da
  // lista liga o registro ao catálogo igual, e é o que faz a comparação
  // funcionar depois — por isso o texto empurra para a lista, não para o campo
  // de digitar.
  'sem-coordenada': 'Sem posição do GPS ainda. Escolha da lista abaixo.',
  ok: '',
};

/**
 * Folha de escolha do lugar.
 *
 * Aparece DEPOIS do toque, com o segmento já gravado — pode ser dispensada sem
 * perder nada. O rótulo é complemento; o tempo, que é o dado, já está salvo.
 */
function EscolhaLugar({
  candidatas,
  catalogo,
  motivo,
  onEscolher,
  onDescartar,
}: {
  candidatas: Array<{ place: Place; distancia: number }>;
  /** Catálogo inteiro, para quando não há posição que permita ordenar. */
  catalogo: Place[];
  motivo: string;
  onEscolher: (escolha: Place | string) => void;
  onDescartar: () => void;
}) {
  const [digitado, setDigitado] = useState('');
  const [busca, setBusca] = useState('');

  // Sem posição não há distância para ordenar, mas o catálogo continua lá. Na
  // primeira versão esta folha ficava sem lista nenhuma nesse caso e só
  // oferecia digitar — e o texto digitado não liga ao catálogo, então o dia
  // 19/09/2026 inteiro foi medido e ficou de fora da tela de comparação. A
  // lista alfabética resolve: o registro linka igual, só sem a ajuda da
  // ordenação por proximidade.
  const semPosicao = candidatas.length === 0;
  const normaliza = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const listaCompleta = semPosicao
    ? catalogo
        .filter(p => normaliza(p.name).includes(normaliza(busca)))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70">
      <div
        className="max-h-[80dvh] w-full overflow-y-auto rounded-t-3xl bg-slate-800 p-5"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Onde você está?</h2>
            <p className="mt-0.5 text-sm text-slate-400">{MOTIVO_TEXTO[motivo] ?? ''}</p>
          </div>
          <button onClick={onDescartar} className="shrink-0 text-sm text-slate-400">
            Depois
          </button>
        </div>

        <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
          {semPosicao ? 'Paradas do catálogo' : 'Mais perto daqui'}
        </p>

        {semPosicao && (
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Filtrar pelo nome"
            className="mt-2 w-full rounded-xl bg-slate-700 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        )}

        <div className="mt-2 space-y-2">
          {!semPosicao &&
            candidatas.slice(0, 5).map(({ place, distancia }) => (
              <button
                key={place.id}
                onClick={() => onEscolher(place)}
                className="flex w-full items-center justify-between gap-3 rounded-xl bg-slate-700 px-4 py-3 text-left active:bg-slate-600"
              >
                <span className="min-w-0 truncate">{place.name}</span>
                <span className="shrink-0 text-sm text-slate-400 tabular-nums">
                  {distancia < 1000 ? `${Math.round(distancia)} m` : `${(distancia / 1000).toFixed(1)} km`}
                </span>
              </button>
            ))}

          {semPosicao &&
            listaCompleta.map(place => (
              <button
                key={place.id}
                onClick={() => onEscolher(place)}
                className="w-full truncate rounded-xl bg-slate-700 px-4 py-3 text-left active:bg-slate-600"
              >
                {place.name}
              </button>
            ))}

          {semPosicao && listaCompleta.length === 0 && (
            <p className="text-sm text-slate-400">
              {catalogo.length === 0
                ? 'Nenhuma parada com coordenada no catálogo.'
                : 'Nenhuma parada com esse nome.'}
            </p>
          )}
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-slate-500">Ou escreva o lugar</p>
        <div className="mt-2 flex gap-2">
          <input
            value={digitado}
            onChange={e => setDigitado(e.target.value)}
            placeholder="Ex.: restaurante no Cosme Velho"
            className="min-w-0 flex-1 rounded-xl bg-slate-700 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => digitado.trim() && onEscolher(digitado)}
            disabled={!digitado.trim()}
            className="rounded-xl bg-emerald-500 px-5 py-3 font-medium text-white disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
