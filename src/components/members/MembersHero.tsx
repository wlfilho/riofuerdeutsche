import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface MembersHeroProps {
  userName: string;
  userPlan: 'free' | 'premium';
}

export default function MembersHero({ userName, userPlan }: MembersHeroProps) {
  const t = useTranslations('public.dashboard.hero');

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden bg-gray-900 border-b-4 border-rio-yellow">

      {/* Imagem de fundo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/home-pao-de-acucar.webp"
          alt="Rio de Janeiro"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8">
        <div className="max-w-3xl space-y-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm">
            <span>{t('badge')}</span>
          </div>

          {/* Título */}
          <h1 className="text-4xl lg:text-[clamp(28px,3.5vw,52px)] font-heading font-black text-white leading-[1.15] tracking-tight">
            {t.rich('willkommenZurueck', {
              name: userName,
              highlight: (chunks) => <span className="text-rio-yellow">{chunks}</span>,
            })}
          </h1>

          {/* Subtítulo */}
          <p className="text-xl lg:text-2xl font-bold text-rio-yellow">
            {t('untertitel')}
          </p>

          {/* Botão */}
          <div className="pt-2">
            {userPlan === 'free' ? (
              <a
                href="/dashboard?upgrade=true"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rio-yellow text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-400 transition-colors"
              >
                {t('guideFreischalten')}
              </a>
            ) : (
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 text-white rounded-full font-bold text-lg border border-white/25 hover:bg-white/25 transition-colors"
              >
                {t('zumGuide')}
              </a>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
