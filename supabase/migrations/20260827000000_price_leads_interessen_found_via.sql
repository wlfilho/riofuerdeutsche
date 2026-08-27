-- Fase 2: o que a pessoa quer, e como ela diz que nos achou.

-- Temas escolhidos no multi-select da /anfrage. text[] e não a coluna
-- `activities` (jsonb, 0 de 66 registros) porque `activities` NÃO estava
-- livre: LeadActivities.tsx no admin a consome esperando
-- {id,name,duration_min,price_eur}[] e filtra por 'name' in a — um array de
-- slugs seria descartado em silêncio, mostrando o estado vazio. Reusar custava
-- reescrever aquele componente do mesmo jeito, e deixaria uma coluna jsonb
-- chamada "activities" guardando temas.
--
-- text[] também torna trivial a pergunta que esta fase existe pra responder:
--   select unnest(interessen), count(*) from price_leads group by 1;
alter table price_leads add column interessen text[];
comment on column price_leads.interessen is
  'Temas escolhidos no multi-select da /anfrage (slugs do catálogo de tours). null/vazio = não respondeu; {unentschlossen} = pediu recomendação.';

-- Resposta ao "Wie hast du uns gefunden?", que fica na PÁGINA DE SUCESSO e não
-- no formulário: o formulário já cresce com o multi-select, e no mobile (67%
-- dos visitantes) cada campo a mais é risco de abandono. Depois do envio não há
-- o que abandonar.
--
-- Não confundir com os outros dois eixos de origem que já existem:
--   source          = canal de submissão   (medido, sempre 'form' aqui)
--   arrival_channel = de onde veio         (medido, do ?von= da URL)
--   found_via       = o que a pessoa DIZ   (declarado, esta coluna)
-- Os três divergem legitimamente no mesmo lead — e é na divergência que está a
-- informação sobre IA: assistente que não passa referrer chega como null em
-- arrival_channel e 'ki' aqui.
alter table price_leads add column found_via text;
comment on column price_leads.found_via is
  'Resposta declarada ao "Wie hast du uns gefunden?" na página de sucesso. Declarado, não medido — ver arrival_channel e source.';

-- Texto livre do "Gibt es etwas, das ihr unbedingt sehen wollt?".
-- Coluna própria e NÃO `notes`: notes é a anotação manual do Will no admin
-- (33 dos 66 leads já têm), e misturar texto do cliente com nota interna é
-- irreversível — depois não dá pra saber quem escreveu o quê.
alter table price_leads add column wunsch text;
comment on column price_leads.wunsch is
  'Pedido em texto livre do cliente na /anfrage. Escrito pelo CLIENTE — não confundir com notes, que é anotação interna do admin.';
