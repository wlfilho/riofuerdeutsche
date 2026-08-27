-- Assunto do pedido, quando o CTA não é de uma página de tour. Hoje só
-- 'unterkunft': a consultoria de hospedagem nunca foi prestada e não tem
-- preço definido, então em vez de construir a página os CTAs existentes
-- apontam pra /anfrage?von=site&thema=unterkunft. É teste de demanda — se
-- aparecerem pedidos, aí se constrói sabendo o que as pessoas pedem.
--
-- Separado de tour_slug de propósito: tour_slug é DE ONDE o pedido veio
-- (atribuição), thema é O QUE a pessoa quer (intenção). Um CTA de hospedagem
-- tem thema='unterkunft' com tour_slug null.
--
-- Sem CHECK, pelo mesmo motivo do arrival_channel e do tour_slug: a Fase 2
-- transforma isto no multi-select de temas e vai acrescentar valores.
alter table price_leads add column thema text;
comment on column price_leads.thema is
  'Assunto do pedido quando não parte de página de tour (?thema= da /anfrage). Hoje só "unterkunft", como teste de demanda. Intenção, não atribuição — ver tour_slug.';
