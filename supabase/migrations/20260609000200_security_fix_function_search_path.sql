-- BAIXO: fixar search_path das funções (evita sequestro de search_path).
-- Todas só usam now()/jsonb_*/net.http_post (já qualificado), então '' é seguro.
ALTER FUNCTION public.contacts_set_updated_at() SET search_path = '';
ALTER FUNCTION public.set_updated_at() SET search_path = '';
ALTER FUNCTION public.update_email_templates_timestamp() SET search_path = '';
ALTER FUNCTION public.update_site_settings_timestamp() SET search_path = '';
ALTER FUNCTION public.notify_admin_on_review() SET search_path = '';
