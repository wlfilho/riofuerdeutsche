-- ============================================================
-- CRÍTICO #1: Fechar upgrade_to_premium para anon/authenticated.
-- A função SECURITY DEFINER não tem checagem interna; só a
-- service_role (usada em /api/membership/upgrade) deve executá-la.
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, integer, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, integer, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.upgrade_to_premium(uuid, integer, text) FROM authenticated;

-- ============================================================
-- CRÍTICO #2: Parar o vazamento de PII da tabela profiles.
-- Antes: "Public profiles are viewable by everyone" USING (true)
-- expunha email/payment_id de todos via anon key.
-- Agora: cada usuário lê só o próprio; admin lê todos (via helper
-- SECURITY DEFINER, dono postgres c/ BYPASSRLS -> sem recursão).
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = uid AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Users and admins can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.is_admin(auth.uid()));
