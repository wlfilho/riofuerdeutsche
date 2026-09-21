/**
 * Medidas de alvo de toque, compartilhadas pelas telas do cronômetro.
 *
 * Vivem como constante, e não como classe copiada em cada tela, porque o
 * requisito é o mesmo nas quatro e é justamente o tipo de número que diverge
 * quando é copiado. Um controle de 32 px sobrando numa tela é um controle que
 * não se acerta andando, e ninguém repara nisso lendo o diff.
 *
 * Os números vêm de uso real, não de gosto:
 *
 *  - 48 px é o piso. É o mínimo de alvo do Material e o que a mão acerta sem
 *    olhar. A HIG da Apple fala em 44, que é pouco para quem está no sol, em
 *    pé, com cliente ao lado esperando resposta sobre outra coisa.
 *  - 56 px em quem carrega a ação principal da tela.
 *  - `text-base` (16 px) em TODO campo de formulário, e isto não é estética: a
 *    partir de 15 px para baixo o Safari do iPhone dá zoom sozinho ao focar o
 *    campo, e a tela inteira sai de lugar no meio de uma correção. Era o que
 *    acontecia com os `text-sm` dos campos de hora na revisão.
 *
 * Tudo aqui é para dedo, não para mouse: nenhuma classe depende de `hover`,
 * que não existe no aparelho, e o retorno de toque vem de `active:`. Dois
 * utilitários entram em todo alvo pelo mesmo motivo prático:
 * `touch-manipulation` corta o atraso de ~300 ms que o navegador guarda para
 * ver se vem um segundo toque, e `select-none` impede que pressionar firme
 * abra o menu de copiar em cima do botão, que é o que a mão faz quando o dedo
 * hesita.
 */

/** Alvo secundário: 48 px, com o toque pegando a área inteira e não só o texto. */
export const ALVO =
  'inline-flex min-h-12 touch-manipulation select-none items-center justify-center gap-2 rounded-xl px-4 text-base';

/** Alvo de ação principal: 56 px. */
export const ALVO_GRANDE =
  'inline-flex min-h-14 touch-manipulation select-none items-center justify-center gap-2 rounded-xl px-5 text-base font-medium';

/** Confirma e avança. Verde, porque é o que o app faz de bom. */
export const BOTAO_PRIMARIO = `${ALVO_GRANDE} bg-emerald-500 text-white active:bg-emerald-600 disabled:opacity-40`;

/** Ação secundária de contorno: presente, sem competir com a primária. */
export const BOTAO_SECUNDARIO = `${ALVO} border border-slate-600 text-slate-200 active:bg-slate-700 disabled:opacity-40`;

/** Ação que muda o dado num sentido que pede atenção (rebaixar, encerrar). */
export const BOTAO_ATENCAO = `${ALVO} border border-amber-600/60 text-amber-300 active:bg-amber-950/40 disabled:opacity-40`;

/** Reabilitar um registro rebaixado. */
export const BOTAO_OK = `${ALVO} border border-emerald-600/60 text-emerald-300 active:bg-emerald-950/40 disabled:opacity-40`;

/** Campo de texto, hora ou lista. 48 px e 16 px de fonte, pelo motivo acima. */
export const CAMPO =
  'min-h-12 w-full rounded-xl bg-slate-700 px-4 text-base text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500';

/** Item de lista tocável: 56 px, porque escolher o lugar é o alvo da folha. */
export const ITEM_LISTA =
  'flex min-h-14 w-full touch-manipulation select-none items-center justify-between gap-3 rounded-xl bg-slate-700 px-4 py-2 text-left text-base active:bg-slate-600';

/** Navegar entre as telas do cronômetro. */
export const BOTAO_NAV = `${ALVO} bg-slate-800 text-slate-200 active:bg-slate-700`;

/** Seletor de dia nas telas de revisão e comparação. */
export function chipDia(ativo: boolean): string {
  return `${ALVO} tabular-nums ${
    ativo ? 'bg-emerald-500 font-medium text-white' : 'bg-slate-800 text-slate-300 active:bg-slate-700'
  }`;
}
