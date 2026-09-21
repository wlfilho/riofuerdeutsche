import Link from 'next/link';
import { BOTAO_NAV, chipDia } from '../toque';
import { getDiasComRegistro, getParadas, getRegistrosDoDia, hojeNoRio } from '@/lib/cronometro/server';
import RevisaoClient from './RevisaoClient';

export const dynamic = 'force-dynamic';

export default async function RevisaoPage({
  searchParams,
}: {
  searchParams: Promise<{ dia?: string }>;
}) {
  const { dia } = await searchParams;
  const [dias, hoje] = await Promise.all([getDiasComRegistro(), Promise.resolve(hojeNoRio())]);
  // Sem ?dia, mostra o último dia COM registro em vez de hoje: revisar quase
  // sempre acontece depois do tour, e abrir num dia vazio esconderia o que há.
  const alvo = dia ?? dias[0] ?? hoje;
  const [registros, paradas] = await Promise.all([getRegistrosDoDia(alvo), getParadas()]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Revisão do dia</h1>
        <Link href="/cronometro" className={`shrink-0 ${BOTAO_NAV}`}>
          Voltar
        </Link>
      </div>

      {dias.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {dias.slice(0, 10).map(d => (
            <Link
              key={d}
              href={`/cronometro/revisao?dia=${d}`}
              className={chipDia(d === alvo)}
            >
              {d.split('-').reverse().slice(0, 2).join('/')}
            </Link>
          ))}
        </div>
      )}

      <RevisaoClient registros={registros} paradas={paradas} dia={alvo} />
    </div>
  );
}
