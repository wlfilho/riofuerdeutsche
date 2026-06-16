import { getSettings, buildContactUrls } from '@/lib/settings'
import Navbar from './Navbar'

export default async function NavbarServer() {
  const settings = await getSettings()
  const c = buildContactUrls(settings)
  return (
    <Navbar
      contact={{
        phone: c.phone,
        phoneHref: c.phoneHref,
        instagramHref: c.instagramHref,
        youtubeHref: c.youtubeHref,
      }}
    />
  )
}
