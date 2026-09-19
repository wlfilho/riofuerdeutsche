/**
 * Armazenamento local do cronômetro (IndexedDB).
 *
 * Offline é requisito, não melhoria: Cristo, Floresta da Tijuca e Rocinha têm
 * sinal ruim ou nenhum, e são justamente as medições mais valiosas. Todo toque
 * grava AQUI primeiro e retorna; a rede é assunto de outro momento. Se o
 * aparelho morrer no meio do tour, o que já foi tocado está em disco.
 *
 * Sem biblioteca: são três objectStores e meia dúzia de operações. Uma
 * dependência a mais custaria mais do que estas ~80 linhas.
 */
import type { CronometroState, Place, Segment } from './types';

const DB_NAME = 'rfd-cronometro';
const DB_VERSION = 1;

/** Segmentos fechados esperando subir. Chave: client_event_id. */
const FILA = 'fila';
/** Estado do aparelho (segmento aberto, tour do dia). Chave fixa 'atual'. */
const ESTADO = 'estado';
/** Cópia das paradas do catálogo, para identificar lugar sem rede. */
const PARADAS = 'paradas';

const CHAVE_ESTADO = 'atual';

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(FILA)) {
        db.createObjectStore(FILA, { keyPath: 'client_event_id' });
      }
      if (!db.objectStoreNames.contains(ESTADO)) db.createObjectStore(ESTADO);
      if (!db.objectStoreNames.contains(PARADAS)) db.createObjectStore(PARADAS);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transacao<T>(
  store: string,
  modo: IDBTransactionMode,
  fn: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, modo);
        const req = fn(tx.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      }),
  );
}

// ─── Fila de segmentos ────────────────────────────────────────────────────────

/**
 * Enfileira (ou substitui) um segmento.
 *
 * `put` e não `add` de propósito: reenviar o mesmo client_event_id é como a
 * revisão corrige um registro, e o banco trata igual, via upsert.
 */
export function enfileirar(seg: Segment): Promise<unknown> {
  return transacao(FILA, 'readwrite', s => s.put(seg));
}

export function lerFila(): Promise<Segment[]> {
  return transacao<Segment[]>(FILA, 'readonly', s => s.getAll());
}

export function removerDaFila(clientEventId: string): Promise<unknown> {
  return transacao(FILA, 'readwrite', s => s.delete(clientEventId));
}

// ─── Estado do aparelho ───────────────────────────────────────────────────────

export function lerEstado(): Promise<CronometroState | null> {
  return transacao<CronometroState | undefined>(ESTADO, 'readonly', s =>
    s.get(CHAVE_ESTADO),
  ).then(v => v ?? null);
}

export function gravarEstado(estado: CronometroState): Promise<unknown> {
  return transacao(ESTADO, 'readwrite', s => s.put(estado, CHAVE_ESTADO));
}

// ─── Paradas do catálogo ──────────────────────────────────────────────────────

/**
 * Guarda a cópia das paradas. Chamado a cada carregamento com rede: o catálogo
 * muda devagar, e uma cópia de ontem identifica tão bem quanto a de hoje.
 */
export function gravarParadas(places: Place[]): Promise<unknown> {
  return transacao(PARADAS, 'readwrite', s => s.put(places, 'todas'));
}

export function lerParadas(): Promise<Place[]> {
  return transacao<Place[] | undefined>(PARADAS, 'readonly', s => s.get('todas'))
    .then(v => v ?? []);
}
