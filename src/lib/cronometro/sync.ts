/**
 * Sincronização da fila local com o servidor.
 *
 * Só sobe o que já está fechado e gravado em IndexedDB. Falha de rede não é
 * erro: o segmento fica na fila e sobe na próxima tentativa. O que NUNCA pode
 * acontecer é o toque do botão esperar por isto.
 */
import { lerFila, removerDaFila } from './idb';
import type { Segment } from './types';

export type ResultadoSync = { enviados: number; restantes: number; erro: string | null };

/**
 * Tenta subir tudo o que está na fila.
 *
 * A fila inteira vai numa requisição só: num dia de tour são dezenas de
 * segmentos, e num reencontro com a rede depois de horas no Cristo vale mandar
 * de uma vez em vez de abrir dezenas de conexões numa rede que mal voltou.
 *
 * Só sai da fila o que o servidor confirmou por client_event_id. Confirmar em
 * bloco ("deu 200, apaga tudo") perderia segmento em resposta parcial.
 */
export async function sincronizar(): Promise<ResultadoSync> {
  const fila = await lerFila();
  if (fila.length === 0) return { enviados: 0, restantes: 0, erro: null };

  let aceitos: string[] = [];
  try {
    const res = await fetch('/api/cronometro/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ segments: fila satisfies Segment[] }),
    });
    if (!res.ok) {
      const texto = await res.text();
      return { enviados: 0, restantes: fila.length, erro: texto.slice(0, 200) || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { accepted?: string[] };
    aceitos = data.accepted ?? [];
  } catch (err) {
    // Sem rede: exatamente o caso previsto. A fila fica intacta.
    return { enviados: 0, restantes: fila.length, erro: (err as Error).message };
  }

  await Promise.all(aceitos.map(removerDaFila));
  return { enviados: aceitos.length, restantes: fila.length - aceitos.length, erro: null };
}
