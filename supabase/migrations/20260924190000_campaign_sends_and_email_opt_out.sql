create table public.campaign_sends (
  id uuid primary key default gen_random_uuid(),
  campaign text not null,
  template_slug text not null,
  lead_id uuid references public.price_leads(id) on delete set null,
  to_email text not null,
  subject text,
  status text not null check (status in ('sent', 'failed')),
  resend_id text,
  error_message text,
  created_at timestamptz not null default now()
);

create unique index campaign_sends_template_email_sent_uq
  on public.campaign_sends (template_slug, lower(to_email))
  where status = 'sent';

create index campaign_sends_campaign_idx on public.campaign_sends (campaign, template_slug);

alter table public.campaign_sends enable row level security;

create policy "admin_all_campaign_sends" on public.campaign_sends
  for all to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

alter table public.contacts add column if not exists email_opt_out_at timestamptz;
