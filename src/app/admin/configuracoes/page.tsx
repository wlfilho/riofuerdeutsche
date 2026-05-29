import { getSiteSettings } from '@/app/actions/site-settings'
import ConfiguracoesClient from './ConfiguracoesClient'

export default async function ConfiguracoesPage() {
  const settings = await getSiteSettings()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ConfiguracoesClient initial={settings} />
    </div>
  )
}
