import { getSiteSettings } from '@/app/actions/site-settings'
import { getGuideRateTiers } from '@/lib/proposals'
import ConfiguracoesClient from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const [settings, guideRateTiers] = await Promise.all([getSiteSettings(), getGuideRateTiers()])

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <ConfiguracoesClient initial={settings} initialTiers={guideRateTiers} />
    </div>
  )
}
