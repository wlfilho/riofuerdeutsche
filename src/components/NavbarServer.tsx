import { getSettings, buildContactUrls } from '@/lib/settings'
import Navbar from './Navbar'

export default async function NavbarServer() {
  const settings = await getSettings()
  return <Navbar contact={buildContactUrls(settings)} />
}
