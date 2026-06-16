import { getSettings, buildContactUrls } from '@/lib/settings'
import Footer from './Footer'

export default async function FooterServer() {
  const settings = await getSettings()
  return <Footer contact={buildContactUrls(settings)} />
}
