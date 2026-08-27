-- De qual página de tour partiu a Anfrage (o ?tour= da /anfrage). Null = não
-- veio de página de tour: header, footer, home, FAQ — nesses casos o que
-- identifica a origem é arrival_channel='site'.
--
-- A Fase 2 vai transformar isto na pré-seleção do multi-select de temas; por
-- ora é só atribuição de origem, para saber qual página de tour converte.
--
-- Sem CHECK, de propósito e pelo mesmo motivo do arrival_channel: a lista de
-- tours muda com o negócio, e um CHECK aqui obrigaria uma migration toda vez
-- que o Will criasse um passeio novo. A validação fica em src/lib/tours.ts,
-- do lado da rota, que ignora slug desconhecido em silêncio.
alter table price_leads add column tour_slug text;
comment on column price_leads.tour_slug is
  'Slug da rota /touren/<slug> de onde a Anfrage partiu (?tour= da /anfrage). Null = não veio de página de tour.';
