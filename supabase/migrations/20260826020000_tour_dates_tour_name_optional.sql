-- No calendário, o que não pode faltar é a data + o cliente; o nome do
-- passeio específico é detalhe (já está descrito na proposta) e não deveria
-- bloquear um tour de aparecer. Ver conversa sobre o caso Joachim Tilg
-- (09/2026): dias fechados sumiam do calendário porque ninguém tinha
-- preenchido o nome do tour ainda.
alter table tour_dates alter column tour_name drop not null;
