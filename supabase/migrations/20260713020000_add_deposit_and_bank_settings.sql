-- Bloco "Buchung & Anzahlung" das propostas:
--   - dados bancários ficam nas configurações (site_settings, linha única)
--   - o valor do sinal (deposit_amount) é definido por proposta; null/0 = sem bloco
alter table public.site_settings
  add column bank_account_holder text not null default '',
  add column bank_iban text not null default '',
  add column bank_bic text not null default '',
  add column bank_name text not null default '';

-- Pré-preenchido com os dados usados no Angebot Uwe Mey (Revolut).
update public.site_settings set
  bank_account_holder = 'William Lantelme Filho',
  bank_iban = 'LT62 3250 0338 6470 5980',
  bank_bic = 'REVOLT21',
  bank_name = 'Revolut'
where key = 'email_assinatura';

alter table public.proposals
  add column deposit_amount numeric;
