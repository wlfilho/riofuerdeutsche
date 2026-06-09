-- ============================================================
-- ALTO: reviews — travar UPDATE/DELETE (eram USING(true) p/ qualquer
-- authenticated) e forçar submissões públicas a 'pending'.
-- A moderação no /admin usa service_role, então não é afetada.
-- ============================================================

-- INSERT: público pode submeter, mas só como 'pending' (sem auto-aprovar)
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Public can submit pending reviews"
  ON public.reviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- SELECT (authenticated): membros leem só aprovadas; admin lê tudo.
-- (anon continua com a policy "Public can read approved reviews")
DROP POLICY IF EXISTS "Authenticated can read all reviews" ON public.reviews;
CREATE POLICY "Members read approved, admin reads all"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (status = 'approved' OR public.is_admin(auth.uid()));

-- UPDATE: só admin
DROP POLICY IF EXISTS "Authenticated can update reviews" ON public.reviews;
CREATE POLICY "Only admin can update reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- DELETE: só admin
DROP POLICY IF EXISTS "Authenticated can delete reviews" ON public.reviews;
CREATE POLICY "Only admin can delete reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================================
-- MÉDIO: nps_responses — eram policies USING(true)/WITH CHECK(true)
-- que deixavam anon ler/alterar TODAS as respostas. O fluxo público
-- passa a ser servido por /api/nps (service_role). Aqui deixamos só
-- o admin com acesso direto (dashboard usa o client do navegador).
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert nps" ON public.nps_responses;
DROP POLICY IF EXISTS "Authenticated can insert nps" ON public.nps_responses;
DROP POLICY IF EXISTS "Anyone can read nps by token" ON public.nps_responses;
DROP POLICY IF EXISTS "Anyone can update nps by token" ON public.nps_responses;

CREATE POLICY "Admin full access to nps_responses"
  ON public.nps_responses
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
