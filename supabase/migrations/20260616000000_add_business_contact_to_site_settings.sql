alter table site_settings
  add column if not exists business_phone     text,
  add column if not exists business_whatsapp  text,
  add column if not exists business_email     text,
  add column if not exists business_instagram text,
  add column if not exists business_facebook  text,
  add column if not exists business_youtube   text,
  add column if not exists business_telegram  text,
  add column if not exists business_address   text;
