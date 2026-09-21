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
 *
 * As medidas de alvo saem de `toque.ts` e valem para todo controle desta tela:
 * o botão principal nunca foi o problema, mas em volta dele havia link de
 * texto de 20 px de altura, que é alvo de mouse e não de dedo.
 */
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Car, MapPin } from 'lucide-react';
import { useCronometro, type Fase } from '@/lib/cronometro/useCronometro';
import { RAIO_MATCH_M } from '@/lib/cronometro/rules';
import type { Place } from '@/lib/cronometro/types';
import type { TourDoDia } from '@/lib/cronometro/server';
import {
  BOTAO_ATENCAO,
  BOTAO_NAV,
  BOTAO_PRIMARIO,
  BOTAO_SECUNDARIO,
  CAMPO,
  ITEM_LISTA,
} from './toque';

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

/**
 * O que está correndo agora, dito dentro do próprio botão.
 *
 * A cor já distinguia deslocamento de visita, mas cor sozinha é canal frágil:
 * no sol, com o brilho no máximo, azul e âmbar encostam um no outro, e quem
 * está no meio do tour não tem tempo de conferir. O ícone é a redundância.
 *
 * Só existe com segmento aberto. Parado não há estado em curso, e inventar um
 * ícone para o repouso daria três símbolos para distinguir em vez de dois.
 */
const ESTADO: Partial<Record<Fase, { Icone: typeof Car; texto: string }>> = {
  travel: { Icone: Car, texto: 'Em deslocamento' },
  visit: { Icone: MapPin, texto: 'Em visita' },
};

/**
 * Um degrau mais escuro do que o tom natural de cada cor, por contraste.
 *
 * Medido no próprio app: sobre os tons -500, o texto branco dava 2,13:1 no
 * âmbar, 2,47 no verde e 2,71 no azul. O mínimo para texto grande é 3:1, e a
 * linha de estado, que é menor, pede 4,5:1 — ou seja, nenhum dos três passava,
 * e o âmbar era o pior justamente na visita, que é onde se fica parado no sol
 * olhando a tela. Com -600 os três passam, a família de cor não muda, e o
 * `active:` desce para -700 para o toque continuar dando retorno visível.
 */
const COR: Record<Exclude<Fase, 'carregando'>, string> = {
  parado: 'bg-emerald-600 active:bg-emerald-700',
  travel: 'bg-sky-600 active:bg-sky-700',
  visit: 'bg-amber-600 active:bg-amber-700',
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
        <h1 className="text-2xl font-semibold">Qual tour é este?</h1>
        <p className="mt-1 text-base text-slate-400">
          Há {tours.length} tours em {hoje.split('-').reverse().join('/')}.
        </p>
        <div className="mt-6 space-y-3">
          {tours.map(t => (
            <button
              key={t.id}
              onClick={() => void escolherTour(t.id)}
              // Bem mais alto que o piso de 48 px: esta escolha acontece com o
              // carro parado, e errar de tour contamina o dia inteiro.
              className="w-full touch-manipulation select-none rounded-2xl bg-slate-800 px-5 py-5 text-left active:bg-slate-700"
            >
              <p className="text-lg font-medium">{t.tour_name ?? 'Tour sem nome'}</p>
              <p className="mt-1 text-base text-slate-400">
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
      {/* Cabeçalho: só o que dá contexto de relance. Nada aqui é tocável, e
          por isso o tamanho é escolhido por legibilidade no sol — o `text-xs`
          que estava aqui não se lia em pé, na rua, de óculos de sol. */}
      <header className="flex items-start justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-base font-medium text-slate-200">
            {tourAtual?.tour_name ?? (tours.length === 0 ? 'Sem tour na agenda de hoje' : 'Tour de hoje')}
          </p>
          <p className="truncate text-sm text-slate-400">
            {estado.lastPlaceLabel ? `Último lugar: ${estado.lastPlaceLabel}` : 'Lugar ainda não identificado'}
          </p>
        </div>
        <div className="shrink-0 text-right text-sm">
          <p className={online ? 'text-slate-400' : 'text-amber-400'}>
            {online ? 'on-line' : 'sem rede'}
          </p>
          {/* Sem dados móveis o GPS leva até um minuto para achar satélite.
              Saber disso ANTES de tocar evita marcar um lugar sem coordenada
              sem perceber, que foi o que esvaziou o primeiro dia de medição. */}
          <p className={gpsPronto ? 'text-emerald-400' : 'text-slate-400'}>
            {gpsPronto ? 'GPS pronto' : 'GPS procurando'}
          </p>
          {naFila > 0 && <p className="text-slate-400">{naFila} na fila</p>}
        </div>
      </header>

      {/* O botão. Ocupa o resto da tela de propósito: é impossível errar o
          alvo andando, e não há um segundo alvo para errar. */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
        <div className="text-center">
          {/* Com segmento aberto, o estado é dito dentro do botão; repetir aqui
              só daria ao olho um segundo lugar para procurar a mesma coisa. */}
          {!aberto && <p className="text-base text-slate-300">{LEGENDA[fase]}</p>}
          {aberto && (
            <p className="font-mono text-5xl tabular-nums text-slate-100">
              {duracaoCurta(corridos)}
            </p>
          )}
          {aberto && (
            <p className="mt-1 text-sm text-slate-400">desde {horaCurta(aberto.started_at)}</p>
          )}
        </div>

        <button
          onClick={() => void tocar()}
          // O limite é o MENOR entre a largura confortável e o espaço vertical
          // que sobra. Preso só à largura, o círculo empurrava o rodapé para
          // fora da tela no iPhone SE justamente quando ele cresce, que é com
          // um segmento aberto e a confirmação de encerrar na tela. 45dvh
          // ainda dá um alvo de ~300 px no menor aparelho.
          className={`flex aspect-square w-full max-w-[min(22rem,45dvh)] touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-full text-white shadow-2xl transition-colors ${COR[fase]}`}
        >
          {(() => {
            const estado = ESTADO[fase];
            if (!estado) return null;
            const { Icone, texto } = estado;
            return (
              <span className="flex items-center gap-2 text-2xl font-semibold">
                <Icone className="h-8 w-8 shrink-0" strokeWidth={2.5} aria-hidden />
                {texto}
              </span>
            );
          })()}
          <span className="text-5xl font-semibold">{ROTULO[fase]}</span>
        </button>
      </main>

      {/* Ações secundárias. Eram três links de texto lado a lado, de ~20 px de
          altura: alvo de mouse, e o de encerrar o dia grudado nos de navegar.
          Agora são botões de 48 px, e encerrar mora em fileira própria, longe
          dos outros dois. */}
      <footer className="space-y-2 py-3">
        <div className="grid grid-cols-2 gap-2">
          <Link href="/cronometro/revisao" className={BOTAO_NAV}>
            Revisão
          </Link>
          <Link href="/cronometro/comparacao" className={BOTAO_NAV}>
            Comparação
          </Link>
        </div>
        {aberto && <EncerrarDia onEncerrar={() => void encerrarDia()} />}
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

/**
 * Encerrar o dia, com confirmação em dois toques.
 *
 * Fechar o segmento aberto e voltar ao repouso não tem volta pela tela: o
 * tempo até o próximo toque deixa de ser medido, e o dia fica com um vão que
 * ninguém sabe explicar depois. Em 20/09/2026 apareceu exatamente um vão
 * desses, de 11:45 a 12:15, num dia em que este era um link de texto colado
 * nos dois de navegação.
 *
 * Dois toques custam nada aqui, porque encerrar acontece uma vez por dia — ao
 * contrário do botão grande, onde qualquer atrito seria inaceitável. A janela
 * se fecha sozinha para o botão não ficar armado no bolso.
 */
function EncerrarDia({ onEncerrar }: { onEncerrar: () => void }) {
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!confirmando) return;
    const t = setTimeout(() => setConfirmando(false), 5_000);
    return () => clearTimeout(t);
  }, [confirmando]);

  if (!confirmando) {
    return (
      <button onClick={() => setConfirmando(true)} className={`${BOTAO_SECUNDARIO} w-full`}>
        Encerrar o dia
      </button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <button onClick={() => setConfirmando(false)} className={BOTAO_SECUNDARIO}>
        Cancelar
      </button>
      <button onClick={onEncerrar} className={BOTAO_ATENCAO}>
        Encerrar mesmo
      </button>
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
    t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const listaCompleta = semPosicao
    ? catalogo
        .filter(p => normaliza(p.name).includes(normaliza(busca)))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70">
      <div
        className="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-slate-800 p-5"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold">Onde você está?</h2>
            <p className="mt-1 text-sm text-slate-400">{MOTIVO_TEXTO[motivo] ?? ''}</p>
          </div>
          {/* "Depois" era texto puro de 20 px, vizinho de nada, no canto que o
              polegar alcança primeiro ao subir a folha. */}
          <button onClick={onDescartar} className={`${BOTAO_SECUNDARIO} shrink-0`}>
            Depois
          </button>
        </div>

        <p className="mt-5 text-sm uppercase tracking-wide text-slate-400">
          {semPosicao ? 'Paradas do catálogo' : 'Mais perto daqui'}
        </p>

        {semPosicao && (
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Filtrar pelo nome"
            className={`mt-2 ${CAMPO}`}
          />
        )}

        <div className="mt-2 space-y-2">
          {!semPosicao &&
            candidatas.slice(0, 5).map(({ place, distancia }) => (
              <button key={place.id} onClick={() => onEscolher(place)} className={ITEM_LISTA}>
                <span className="min-w-0 truncate">{place.name}</span>
                <span className="shrink-0 text-sm text-slate-400 tabular-nums">
                  {distancia < 1000 ? `${Math.round(distancia)} m` : `${(distancia / 1000).toFixed(1)} km`}
                </span>
              </button>
            ))}

          {semPosicao &&
            listaCompleta.map(place => (
              <button key={place.id} onClick={() => onEscolher(place)} className={ITEM_LISTA}>
                <span className="min-w-0 truncate">{place.name}</span>
              </button>
            ))}

          {semPosicao && listaCompleta.length === 0 && (
            <p className="text-base text-slate-400">
              {catalogo.length === 0
                ? 'Nenhuma parada com coordenada no catálogo.'
                : 'Nenhuma parada com esse nome.'}
            </p>
          )}
        </div>

        <p className="mt-6 text-sm uppercase tracking-wide text-slate-400">Ou escreva o lugar</p>
        {/* Campo e botão empilhados, cada um de largura cheia: lado a lado, o
            botão comia a largura do campo e os dois ficavam apertados na tela
            de 375 px. */}
        <div className="mt-2 space-y-2">
          <input
            value={digitado}
            onChange={e => setDigitado(e.target.value)}
            placeholder="Ex.: restaurante no Cosme Velho"
            className={CAMPO}
          />
          <button
            onClick={() => digitado.trim() && onEscolher(digitado)}
            disabled={!digitado.trim()}
            className={`${BOTAO_PRIMARIO} w-full`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
