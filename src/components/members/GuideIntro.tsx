interface GuideIntroProps {
  userPlan: 'free' | 'premium'
}

export default function GuideIntro({ userPlan }: GuideIntroProps) {
  return (
    <div className="w-full bg-white border border-[#e8e4dc] rounded-[10px] px-[18px] py-[14px] mb-[24px] flex items-start gap-3">
      {userPlan === 'free' ? (
        <>
          <span className="text-base flex-shrink-0 mt-0.5">📖</span>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">
              Das Sicherheitskapitel ist kostenlos für dich freigeschaltet.
            </span>
            {' '}Alle weiteren Kapitel sind im vollständigen Rio-Guide enthalten —
            schalte ihn einmalig frei und erhalte alle 4 Editionen für immer.{' '}
            <a
              href="/guide/upgrade"
              className="text-[#22a262] font-semibold underline underline-offset-2 hover:text-[#1a8050] transition-colors whitespace-nowrap"
            >
              Jetzt freischalten →
            </a>
          </p>
        </>
      ) : (
        <>
          <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#e8f5e9] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="#22a262" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-800">
              Du hast vollen Zugang zum Rio-Guide.
            </span>
            {' '}Alle Kapitel sind freigeschaltet. Neue Editionen erscheinen
            automatisch in deinem Bereich — ohne zusätzliche Kosten.
          </p>
        </>
      )}
    </div>
  )
}
