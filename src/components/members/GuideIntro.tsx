interface GuideIntroProps {
  userPlan: 'free' | 'premium'
}

export default function GuideIntro({ userPlan }: GuideIntroProps) {
  return (
    <div className="w-full bg-white border-b border-[#e8e4dc]">
      <div className="max-w-[800px] mx-auto px-6 py-8">
        {userPlan === 'free' ? (
          <div className="space-y-4">
            <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
              Das Sicherheitskapitel ist kostenlos für dich freigeschaltet.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Alle weiteren Kapitel sind im vollständigen Rio-Guide enthalten —
              schalte ihn einmalig frei und erhalte alle 4 Editionen für immer.{' '}
              <a
                href="/guide/upgrade"
                className="text-[#22a262] font-semibold underline underline-offset-2 hover:text-[#1a8050] transition-colors"
              >
                Jetzt freischalten →
              </a>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xl lg:text-2xl font-semibold text-gray-900 leading-snug">
              Du hast vollen Zugang zum Rio-Guide.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Alle Kapitel sind freigeschaltet. Neue Editionen erscheinen
              automatisch in deinem Bereich — ohne zusätzliche Kosten.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
