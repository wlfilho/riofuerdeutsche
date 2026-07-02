-- Public read-only view exposing ONLY the business contact fields from
-- site_settings. site_settings itself stays admin-only (RLS unchanged).
-- Uses default security (definer) so it can read the underlying row while
-- anon only ever sees these whitelisted columns. This lets public pages
-- (Navbar, Footer, tour CTAs, ...) load contact info without granting anon
-- access to internal config (rates, exchange rate, email signature).
create or replace view public.public_contact_info as
select
  business_phone,
  business_whatsapp,
  business_email,
  business_instagram,
  business_facebook,
  business_youtube,
  business_telegram,
  business_address
from public.site_settings
where key = 'email_assinatura';

revoke all on public.public_contact_info from anon, authenticated;
grant select on public.public_contact_info to anon, authenticated;
