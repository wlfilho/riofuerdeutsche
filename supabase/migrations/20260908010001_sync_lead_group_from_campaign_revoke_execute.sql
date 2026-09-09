-- Tira do público o EXECUTE da função de gatilho criada na migration anterior.
--
-- `sync_lead_group_from_campaign()` é SECURITY DEFINER (precisa escrever em
-- lead_groups/lead_group_members ignorando RLS). O PostgreSQL dá EXECUTE a
-- PUBLIC por padrão em toda função nova, então, sem este revoke, qualquer
-- cliente com a chave anônima poderia chamá-la direto pela API e escrever com
-- os privilégios do dono. O gatilho não é afetado: gatilho roda pelo dono da
-- tabela, não por quem disparou o INSERT.
--
-- Foi aplicado no banco em 08/09/2026 sem arquivo correspondente aqui; este
-- arquivo é o registro que faltava, para um clone novo do repo nascer com a
-- mesma permissão de produção.

REVOKE EXECUTE ON FUNCTION public.sync_lead_group_from_campaign()
  FROM anon, authenticated, public;
