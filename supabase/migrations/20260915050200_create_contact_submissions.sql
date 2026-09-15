-- Leads captured by the website contact form (previously the MongoDB
-- `contact_submissions` collection). Written only by the server over a direct
-- Postgres connection.
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  message    text        not null,
  ip         text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Backs the rate-limit lookup: recent submissions by email or ip within a window.
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists contact_submissions_email_idx      on public.contact_submissions (email);
create index if not exists contact_submissions_ip_idx         on public.contact_submissions (ip);

-- The server connects over a direct Postgres connection (which bypasses RLS).
-- Enable RLS with no policies so the anon/authenticated PostgREST roles get no
-- access at all.
alter table public.contact_submissions enable row level security;
