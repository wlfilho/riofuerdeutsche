'use client';

/**
 * A máquina de estados do cronômetro, separada da tela.
 *
 * Duas regras mandam em tudo aqui:
 *
 * 1. O TOQUE NUNCA ESPERA. Nem servidor, nem GPS. O carimbo de tempo é lido no
 *    primeiro instante do handler, antes de qualquer await, porque é ele o
 *    dado que a feature existe para colher. GPS demora de 1 a 20 segundos num
 *    morro; se o horário esperasse por ele, a medição sairia errada justamente
 *    nos lugares que mais interessam.
 *
 * 2. GRAVA LOCAL, SINCRONIZA DEPOIS. O segmento fechado vai para IndexedDB e a
 *    rede é problema de outro momento. Se o aparelho morrer, o que já foi
 *    tocado está em disco.
 *
 * A coordenada chega atrasada e é costurada no segmento depois, pelo
 * client_event_id: como o banco faz upsert por essa coluna, completar um
 * registro é reenviá-lo, não criar outro.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  enfileirar,
  gravarEstado,
  gravarParadas,
  lerEstado,
  lerParadas,
} from './idb';
import { matchPlace, pareceConfiavel, duracaoSegundos, type PlaceMatch } from './rules';
import { sincronizar } from './sync';
import type { CronometroState, Fix, OpenSegment, Place, Segment, SegmentKind } from './types';

export type Fase = 'carregando' | 'parado' | 'travel' | 'visit';

/**
 * Pergunta pendente de lugar, quando o GPS não identificou sozinho.
 *
 * Carrega o SEGMENTO inteiro, não só o id. A resposta precisa ser aplicada
 * àquilo sobre o que se perguntou: se a folha ficar aberta e outro toque
 * acontecer no meio, "o último segmento fechado" já é outro, e o rótulo iria
 * parar no registro errado — deixando sem lugar exatamente o deslocamento que
 * a tela de comparação precisa.
 */
export type PerguntaLugar = {
  segmento: Segment;
  match: PlaceMatch;
};

const ESTADO_VAZIO: CronometroState = {
  tourDateId: null,
  open: null,
  lastPlaceId: null,
  lastPlaceLabel: null,
};

function novoId(): string {
  // randomUUID existe em todo navegador com IndexedDB e HTTPS; o fallback é
  // para o caso de contexto não-seguro, onde a feature não roda mesmo.
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Teto de espera por uma posição.
 *
 * Eram 15 segundos, e isso custou um dia inteiro de medição em 19/09/2026: o
 * Will guiou sem dados móveis, e sem rede não há A-GPS — o aparelho precisa
 * procurar satélite do zero, o que leva de 30 a 60 segundos. Todas as oito
 * marcações do dia estouraram o prazo e foram gravadas sem coordenada.
 *
 * Esperar mais não custa nada na mão de quem usa: o toque já foi gravado
 * antes, e isto roda em segundo plano.
 */
const GPS_TIMEOUT_MS = 60_000;

/**
 * Idade máxima de uma posição para ela ainda valer como "onde estou agora".
 *
 * Curto de propósito. Uma posição de um minuto atrás foi tirada com o carro
 * andando e pode estar a um quilômetro daqui — usá-la para identificar o
 * lugar produziria um acerto aparente e errado, que é pior do que não
 * identificar. Abaixo disso, o erro cabe dentro do raio de 300 m.
 */
const FIX_FRESCO_MS = 20_000;

/**
 * Quanto a pergunta do lugar espera pelo GPS antes de aparecer assim mesmo.
 *
 * A pergunta NÃO pode ficar refém da posição. Com a permissão ainda pendente
 * (nem concedida nem negada), `getCurrentPosition` não resolve nunca — o
 * relógio do timeout só começa depois da resposta do usuário — e a folha de
 * escolha nunca apareceria. O segmento estaria salvo, mas sem lugar e sem
 * ninguém perguntando.
 *
 * Com o GPS aquecido, a posição quase sempre chega antes desta espera e a
 * pergunta nem aparece. Quando ela aparece e a posição chega depois, a
 * identificação automática ainda assume, desde que ninguém tenha respondido.
 */
const ESPERA_ANTES_DE_PERGUNTAR_MS = 6_000;

/** Uma leitura de GPS, com teto de tempo. Falhar é normal e não é erro. */
function lerGPS(timeoutMs = GPS_TIMEOUT_MS): Promise<Fix> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ latitude: null, longitude: null, accuracy: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
      }),
      () => resolve({ latitude: null, longitude: null, accuracy: null }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: FIX_FRESCO_MS },
    );
  });
}

export function useCronometro(paradasIniciais: Place[]) {
  const [fase, setFase] = useState<Fase>('carregando');
  const [estado, setEstado] = useState<CronometroState>(ESTADO_VAZIO);
  const [paradas, setParadas] = useState<Place[]>(paradasIniciais);
  const [pergunta, setPergunta] = useState<PerguntaLugar | null>(null);
  const [naFila, setNaFila] = useState(0);
  const [online, setOnline] = useState(true);
  /** O último envio chegou ao servidor? Null = ainda não houve envio. */
  const [alcance, setAlcance] = useState<boolean | null>(null);
  /** O GPS já tem posição recente? Alimenta o aviso na tela antes do toque. */
  const [gpsPronto, setGpsPronto] = useState(false);

  /** Id do segmento cuja pergunta de lugar está aberta e ainda sem resposta. */
  const perguntaAberta = useRef<string | null>(null);

  /**
   * Espelho do estado, sempre atual.
   *
   * Todo callback aqui é criado uma vez e sobrevive ao tour inteiro; se
   * qualquer um deles lesse `estado` pelo closure, leria o valor de quando foi
   * criado. Isso já custou caro: a auto-seleção do tour do dia gravava
   * `{...estadoDoPrimeiroRender, tourDateId}` e APAGAVA o segmento em
   * andamento de quem reabrisse o app no meio do tour — a medição sumia sem
   * erro nenhum na tela. O ref é a fonte de verdade das mutações; o useState
   * existe só para a tela redesenhar.
   */
  const estadoRef = useRef<CronometroState>(ESTADO_VAZIO);

  const aplicar = useCallback(
    async (fn: (anterior: CronometroState) => CronometroState) => {
      const novo = fn(estadoRef.current);
      estadoRef.current = novo;
      setEstado(novo);
      setFase(novo.open ? novo.open.segment_kind : 'parado');
      await gravarEstado(novo);
    },
    [],
  );

  const tentarSincronizar = useCallback(async () => {
    const r = await sincronizar();
    setNaFila(r.restantes);
    // `navigator.onLine` responde pela interface de rede, não por alcance: no
    // Rio o aparelho fica "on-line" numa barra de sinal que não entrega um
    // pacote, e o indicador mentiria justamente onde importa. O que vale é se
    // o último envio passou. Fila vazia não diz nada (não houve envio), então
    // o estado anterior fica.
    if (r.erro !== null) setAlcance(false);
    else if (r.enviados > 0) setAlcance(true);
    return r;
  }, []);

  // ── Retomada ───────────────────────────────────────────────────────────────
  // Reabrir o app no meio do tour (ou depois de o iOS matar a aba) tem que
  // voltar exatamente onde estava, inclusive com o segmento aberto correndo.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const [salvo, cache] = await Promise.all([lerEstado(), lerParadas()]);
      if (!vivo) return;
      if (cache.length > 0 && paradasIniciais.length === 0) setParadas(cache);
      if (paradasIniciais.length > 0) void gravarParadas(paradasIniciais);
      const atual = salvo ?? ESTADO_VAZIO;
      estadoRef.current = atual;
      setEstado(atual);
      setFase(atual.open ? atual.open.segment_kind : 'parado');
      void tentarSincronizar();
    })();
    return () => { vivo = false; };
  }, [paradasIniciais, tentarSincronizar]);

  // ── Rede ───────────────────────────────────────────────────────────────────
  //
  // Três gatilhos, porque nenhum sozinho basta:
  //
  //  - o evento `online` cobre o caso limpo de o rádio voltar, mas mente com
  //    frequência: no Rio o aparelho fica "on-line" numa barra de sinal que
  //    não entrega um pacote, e o evento nem chega a disparar;
  //  - voltar à aba cobre quem guardou o celular no bolso e tirou de novo;
  //  - o intervalo cobre o pior caso, que é o que importa: a última marcação
  //    do dia falhou, o tour acabou, ninguém mais vai tocar em nada. Sem ele,
  //    aquele segmento esperaria o app ser reaberto para existir no banco.
  useEffect(() => {
    const atualiza = () => {
      setOnline(navigator.onLine);
      void tentarSincronizar();
    };
    const caiu = () => setOnline(false);
    const voltouParaAba = () => {
      if (document.visibilityState === 'visible') atualiza();
    };

    atualiza();
    window.addEventListener('online', atualiza);
    window.addEventListener('offline', caiu);
    document.addEventListener('visibilitychange', voltouParaAba);
    const timer = setInterval(atualiza, 30_000);

    return () => {
      window.removeEventListener('online', atualiza);
      window.removeEventListener('offline', caiu);
      document.removeEventListener('visibilitychange', voltouParaAba);
      clearInterval(timer);
    };
  }, [tentarSincronizar]);

  // ── GPS aquecido ───────────────────────────────────────────────────────────
  //
  // Pedir a posição só no toque significa acordar o chip do zero toda vez. Sem
  // dados móveis isso leva de 30 a 60 segundos, e o lugar do tour acaba sem
  // identificação — foi o que aconteceu no primeiro dia de uso real.
  //
  // Com o watch ligado enquanto o app está na tela, o chip já está procurando
  // antes do toque, e a posição costuma estar pronta quando o dedo chega. O
  // resultado não é guardado aqui: quem lê é o getCurrentPosition, que
  // aproveita o cache do sistema que este watch mantém quente.
  //
  // Para na hora em que o app sai da tela. O sistema suspenderia de qualquer
  // forma, mas parar explicitamente deixa claro que não há rastreamento em
  // segundo plano — não existe, e não deve existir: o iOS não acorda PWA em
  // background, então seria uma função que funciona no Android e falha em
  // silêncio no iPhone.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    let id: number | null = null;

    const comecar = () => {
      if (id !== null) return;
      id = navigator.geolocation.watchPosition(
        () => setGpsPronto(true),
        () => setGpsPronto(false),
        { enableHighAccuracy: true, maximumAge: FIX_FRESCO_MS, timeout: GPS_TIMEOUT_MS },
      );
    };
    const parar = () => {
      if (id === null) return;
      navigator.geolocation.clearWatch(id);
      id = null;
    };
    const aoMudarVisibilidade = () => {
      if (document.visibilityState === 'visible') comecar();
      else parar();
    };

    aoMudarVisibilidade();
    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    return () => {
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      parar();
    };
  }, []);

  /** Completa o segmento recém-fechado com coordenada e lugar do fim. */
  const completarComGPS = useCallback(async (
    fechado: Segment | null,
    abertoId: string | null,
    identificarLugar: boolean,
  ) => {
    // A posição pode demorar, e pode não vir nunca. Por isso a pergunta do
    // lugar é disparada por um relógio próprio, e não pelo fim desta espera:
    // se o GPS ganhar a corrida, ninguém é incomodado; se perder, a pergunta
    // aparece com o catálogo inteiro e a posição ainda pode assumir depois.
    const promessaFix = lerGPS();

    if (identificarLugar && fechado) {
      perguntaAberta.current = fechado.client_event_id;
      setTimeout(() => {
        if (perguntaAberta.current !== fechado.client_event_id) return;
        setPergunta(atual => atual ?? {
          segmento: fechado,
          match: { auto: null, motivo: 'sem-coordenada', candidatas: [] },
        });
      }, ESPERA_ANTES_DE_PERGUNTAR_MS);
    }

    const fix = await promessaFix;

    // O segmento aberto também quer a coordenada de partida.
    if (abertoId) {
      await aplicar(prev =>
        !prev.open || prev.open.client_event_id !== abertoId
          ? prev
          : {
              ...prev,
              open: {
                ...prev.open,
                start_latitude: fix.latitude,
                start_longitude: fix.longitude,
                gps_accuracy_m: fix.accuracy === null ? null : Math.round(fix.accuracy),
              },
            },
      );
    }

    if (!fechado) return;

    const match = identificarLugar ? matchPlace(fix, paradas) : null;
    const completo: Segment = {
      ...fechado,
      end_latitude: fix.latitude,
      end_longitude: fix.longitude,
      gps_accuracy_m: fix.accuracy === null ? null : Math.round(fix.accuracy),
      to_service_id: match?.auto?.id ?? fechado.to_service_id,
    };
    await enfileirar(completo);

    // Uma resposta manual que já tenha chegado manda: quem estava lá sabe
    // melhor que a coordenada atrasada.
    const jaRespondeu = perguntaAberta.current !== completo.client_event_id;

    if (match?.auto && !jaRespondeu) {
      // Identificou: o lugar vira também o ponto de partida do próximo trecho.
      perguntaAberta.current = null;
      setPergunta(atual => (atual?.segmento.client_event_id === completo.client_event_id ? null : atual));
      await aplicar(prev => ({
        ...prev,
        lastPlaceId: match.auto!.id,
        lastPlaceLabel: match.auto!.name,
        open: prev.open && prev.open.client_event_id === abertoId
          ? { ...prev.open, from_service_id: match.auto!.id }
          : prev.open,
      }));
    } else if (identificarLugar && !jaRespondeu) {
      // Não identificou: pergunta, sem bloquear nada. O segmento já está
      // gravado e já vai subir; o rótulo é um complemento que pode chegar
      // agora, daqui a uma hora ou na tela de revisão. Se a folha já está na
      // tela pelo relógio acima, esta chamada só a enriquece com as candidatas
      // ordenadas, que antes não existiam.
      setPergunta({ segmento: completo, match: match! });
    }

    void tentarSincronizar();
  }, [paradas, tentarSincronizar, aplicar]);

  /**
   * O toque no botão. Fecha o que estiver aberto e abre o próximo.
   *
   * `agora` é lido na primeira linha e usado nas duas pontas: o fim de um
   * segmento e o início do seguinte são o MESMO instante, senão a soma dos
   * segmentos não fecha com o relógio do dia.
   */
  const tocar = useCallback(async () => {
    const agora = new Date().toISOString();

    const atual = estadoRef.current;
    const aberto = atual.open;
    const proximoKind: SegmentKind =
      !aberto ? 'travel' : aberto.segment_kind === 'travel' ? 'visit' : 'travel';

    let fechado: Segment | null = null;
    if (aberto) {
      const duracao = duracaoSegundos(aberto.started_at, agora);
      fechado = {
        client_event_id: aberto.client_event_id,
        tour_date_id: aberto.tour_date_id,
        segment_kind: aberto.segment_kind,
        from_service_id: aberto.from_service_id,
        // Numa visita, começo e fim são o mesmo lugar; num deslocamento, o
        // destino ainda vai ser identificado pelo GPS logo abaixo.
        to_service_id: aberto.segment_kind === 'visit' ? aberto.from_service_id : null,
        place_label: null,
        started_at: aberto.started_at,
        ended_at: agora,
        start_latitude: aberto.start_latitude,
        start_longitude: aberto.start_longitude,
        end_latitude: null,
        end_longitude: null,
        gps_accuracy_m: aberto.gps_accuracy_m,
        reliable: pareceConfiavel(aberto.segment_kind, duracao),
        note: null,
      };
      await enfileirar(fechado);
    }

    const novoAberto: OpenSegment = {
      client_event_id: novoId(),
      tour_date_id: atual.tourDateId,
      segment_kind: proximoKind,
      from_service_id: atual.lastPlaceId,
      started_at: agora,
      start_latitude: null,
      start_longitude: null,
      gps_accuracy_m: null,
    };

    await aplicar(prev => ({ ...prev, open: novoAberto }));

    // Daqui para baixo nada segura o dedo: GPS, identificação e rede correm
    // soltos e costuram o registro quando responderem.
    void completarComGPS(fechado, novoAberto.client_event_id, proximoKind === 'visit');
  }, [aplicar, completarComGPS]);

  /** Fecha o segmento aberto e volta ao repouso. */
  const encerrarDia = useCallback(async () => {
    const agora = new Date().toISOString();
    const aberto = estadoRef.current.open;
    if (aberto) {
      const duracao = duracaoSegundos(aberto.started_at, agora);
      const fechado: Segment = {
        client_event_id: aberto.client_event_id,
        tour_date_id: aberto.tour_date_id,
        segment_kind: aberto.segment_kind,
        from_service_id: aberto.from_service_id,
        to_service_id: aberto.segment_kind === 'visit' ? aberto.from_service_id : null,
        place_label: null,
        started_at: aberto.started_at,
        ended_at: agora,
        start_latitude: aberto.start_latitude,
        start_longitude: aberto.start_longitude,
        end_latitude: null,
        end_longitude: null,
        gps_accuracy_m: aberto.gps_accuracy_m,
        reliable: pareceConfiavel(aberto.segment_kind, duracao),
        note: null,
      };
      await enfileirar(fechado);
    }
    await aplicar(prev => ({ ...ESTADO_VAZIO, tourDateId: prev.tourDateId }));
    void tentarSincronizar();
  }, [aplicar, tentarSincronizar]);

  /**
   * Resposta da pergunta de lugar: uma parada do catálogo, ou um nome digitado.
   *
   * O alvo vem da própria pergunta, e não do último segmento fechado: entre
   * abrir a folha e responder, outro toque pode ter fechado outro segmento.
   */
  const responderLugar = useCallback(async (alvo: Segment, escolha: Place | string) => {
    perguntaAberta.current = null;
    setPergunta(null);

    const place = typeof escolha === 'string' ? null : escolha;
    const completo: Segment = {
      ...alvo,
      to_service_id: place?.id ?? null,
      place_label: place ? null : (escolha as string).trim() || null,
    };
    await enfileirar(completo);

    await aplicar(prev => ({
      ...prev,
      lastPlaceId: place?.id ?? null,
      lastPlaceLabel: place?.name ?? (escolha as string),
      open: prev.open ? { ...prev.open, from_service_id: place?.id ?? null } : prev.open,
    }));

    void tentarSincronizar();
  }, [aplicar, tentarSincronizar]);

  // Só troca o tour, preservando o que já estiver em andamento. Era aqui que
  // o segmento aberto morria, quando esta função escrevia um objeto inteiro
  // montado sobre um `estado` capturado antes da retomada terminar.
  const escolherTour = useCallback(async (tourDateId: string) => {
    await aplicar(prev => ({ ...prev, tourDateId }));
  }, [aplicar]);

  return {
    fase,
    estado,
    paradas,
    pergunta,
    naFila,
    // Só afirma que está conectado quem tem interface E último envio aceito.
    online: online && alcance !== false,
    gpsPronto,
    tocar,
    encerrarDia,
    responderLugar,
    escolherTour,
    descartarPergunta: () => {
      perguntaAberta.current = null;
      setPergunta(null);
    },
    sincronizarAgora: tentarSincronizar,
  };
}
