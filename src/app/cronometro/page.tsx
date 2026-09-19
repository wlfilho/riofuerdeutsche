import { getParadas, getToursDoDia, hojeNoRio } from '@/lib/cronometro/server';
import CronometroApp from './CronometroApp';

// O dia muda, a escala muda, e o app é aberto na rua: nada aqui pode vir de
// cache de build.
export const dynamic = 'force-dynamic';

export default async function CronometroPage() {
  const hoje = hojeNoRio();
  const [tours, paradas] = await Promise.all([getToursDoDia(hoje), getParadas()]);

  return <CronometroApp hoje={hoje} tours={tours} paradas={paradas} />;
}
