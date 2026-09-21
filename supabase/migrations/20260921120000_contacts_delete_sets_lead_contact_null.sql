-- Deletar um contato em /admin/contatos nunca funcionava: price_leads.contact_id
-- apontava para contacts(id) sem ON DELETE, ou seja NO ACTION, e a coluna ainda
-- era NOT NULL. Como quase todo contato tem pelo menos um lead, o DELETE batia
-- em violação de chave estrangeira (23503) e o contato continuava lá.
--
-- O comportamento prometido pela tela de confirmação sempre foi outro: "leads
-- vinculados ficarão sem contato associado". O lead guarda a própria cópia de
-- nome, e-mail e telefone, então ele continua legível sem o contato. O código
-- que lê contact_id já trata o nulo (admin/crm/page.tsx, LeadDrawer.tsx,
-- admin/contatos/page.tsx), então basta o banco permitir.

alter table public.price_leads
  alter column contact_id drop not null;

alter table public.price_leads
  drop constraint price_leads_contact_id_fkey;

alter table public.price_leads
  add constraint price_leads_contact_id_fkey
  foreign key (contact_id) references public.contacts(id)
  on delete set null;
