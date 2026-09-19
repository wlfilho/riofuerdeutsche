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

/** Pergunta pendente de lugar, quando o GPS não identificou sozinho. */
export type PerguntaLugar = {
  /** Segmento a rotular quando a resposta vier. */
  clientEventId: string;
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

/** Uma leitura de GPS, com teto de tempo. Falhar é normal e não é erro. */
function lerGPS(timeoutMs = 15_000): Promise<Fix> {
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
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 10_000 },
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

  // O último segmento fechado fica à mão para receber a coordenada e o lugar
  // quando o GPS finalmente responder.
  const ultimoFechado = useRef<Segment | null>(null);

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

  /** Completa o segmento recém-fechado com coordenada e lugar do fim. */
  const completarComGPS = useCallback(async (
    fechado: Segment | null,
    abertoId: string | null,
    identificarLugar: boolean,
  ) => {
    const fix = await lerGPS();

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
    ultimoFechado.current = completo;
    await enfileirar(completo);

    if (match?.auto) {
      // Identificou: o lugar vira também o ponto de partida do próximo trecho.
      await aplicar(prev => ({
        ...prev,
        lastPlaceId: match.auto!.id,
        lastPlaceLabel: match.auto!.name,
        open: prev.open && prev.open.client_event_id === abertoId
          ? { ...prev.open, from_service_id: match.auto!.id }
          : prev.open,
      }));
    } else if (identificarLugar) {
      // Não identificou: pergunta, sem bloquear nada. O segmento já está
      // gravado e já vai subir; o rótulo é um complemento que pode chegar
      // agora, daqui a uma hora ou na tela de revisão.
      setPergunta({ clientEventId: completo.client_event_id, match: match! });
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
      ultimoFechado.current = fechado;
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

  /** Resposta da pergunta de lugar: uma parada do catálogo, ou um nome digitado. */
  const responderLugar = useCallback(async (escolha: Place | string) => {
    const alvo = ultimoFechado.current;
    setPergunta(null);
    if (!alvo) return;

    const place = typeof escolha === 'string' ? null : escolha;
    const completo: Segment = {
      ...alvo,
      to_service_id: place?.id ?? null,
      place_label: place ? null : (escolha as string).trim() || null,
    };
    ultimoFechado.current = completo;
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
    tocar,
    encerrarDia,
    responderLugar,
    escolherTour,
    descartarPergunta: () => setPergunta(null),
    sincronizarAgora: tentarSincronizar,
  };
}
