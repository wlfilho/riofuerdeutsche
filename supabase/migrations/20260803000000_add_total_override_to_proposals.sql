-- Preço final manual da proposta: o Will pode fechar um valor negociado por
-- cima do total calculado (soma dos itens). Quando total_override_amount está
-- presente, total_amount passa a gravar esse valor (o que o cliente paga) e a
-- soma calculada segue recuperável pelos items. discount_visible controla como
-- o cliente vê a diferença: true = Zwischensumme + linha de Rabatt + total;
-- false = só o preço final, sem menção ao desconto.
alter table public.proposals
  add column total_override_amount numeric,
  add column discount_visible boolean not null default false;
