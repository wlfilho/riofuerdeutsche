-- 'other' era o balde de dois fatos diferentes: submissão do formulário
-- público e cadastro manual feito pelo Will no admin. Sem separar, não dá
-- pra medir se a Fase 1 (CTAs → /anfrage) moveu alguma coisa.
--
-- 'form' passa a ser o canal de SUBMISSÃO; 'other' fica reservado pro
-- cadastro manual. Registros antigos NÃO são reclassificados: dos 28 com
-- source='other' hoje, 17 são da campanha aida-karneval-2028 (cadastro em
-- massa de agosto, identificáveis pela coluna `campaign`) e 11 são os leads
-- sem campanha de 30/07 em diante, que misturam formulário e cadastro manual
-- sem forma confiável de distinguir. Reescrever isso estragaria a linha de
-- base de 26/08/2026 (4,4 pedidos/semana, 33% de fechamento), que é o ponto
-- de corte da Fase 1.
alter table price_leads drop constraint price_leads_source_check;
alter table price_leads add constraint price_leads_source_check
  check (source in ('calculator','email','whatsapp','instagram','referral','other','form'));

-- Canal de CHEGADA, separado do canal de submissão: quem veio do WhatsApp
-- e preencheu o formulário é source='form' + arrival_channel='whatsapp'.
-- Sem CHECK de propósito — a Fase 2 vai acrescentar valores, e um CHECK aqui
-- repetiria exatamente o bloqueio que esta migration está removendo acima.
alter table price_leads add column arrival_channel text;
comment on column price_leads.arrival_channel is
  'Canal por onde o visitante chegou antes de preencher (?von= da /anfrage). Não confundir com source, que é o canal de submissão.';
