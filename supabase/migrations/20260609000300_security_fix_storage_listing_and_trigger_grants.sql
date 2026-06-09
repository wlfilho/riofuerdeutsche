-- BAIXO/MÉDIO: bucket review-photos é público -> URLs continuam funcionando
-- sem esta policy. Ela só permitia LISTAR/enumerar todos os arquivos. Remover.
DROP POLICY IF EXISTS "Review photos are public" ON storage.objects;

-- BAIXO: funções de TRIGGER não devem ser chamáveis via REST (/rpc/...).
-- Elas continuam disparando normalmente como triggers (rodam como dono da tabela).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_admin_on_review() FROM PUBLIC, anon, authenticated;
