-- supabase/migrations/001_init.sql

-- Extensions
create extension if not exists "pgcrypto";

-- ENUMs for type safety
do $$ begin
  create type ticket_status as enum ('open','in_progress','waiting_customer','resolved','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_priority as enum ('low','medium','high','urgent');
exception when duplicate_object then null; end $$;

-- 1. Organizations (multi-tenant)
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. Profiles (Public metadata for users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- 3. Memberships / Roles
create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','agent','viewer')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- 4. Tickets
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  subject text not null,
  description text,
  status ticket_status not null default 'open',
  priority ticket_priority not null default 'medium',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Ticket messages (thread)
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  kind text not null check (kind in ('public_reply','internal_note')),
  body text not null,
  created_at timestamptz not null default now()
);

-- 6. Knowledge Base articles
create table if not exists public.kb_articles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  slug text not null,
  title text not null,
  content_md text not null,
  is_public boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, slug)
);

-- 7. Audit log
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- --- TRIGGERS ---

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tickets_updated_at before update on public.tickets
for each row execute function set_updated_at();

create trigger trg_kb_updated_at before update on public.kb_articles
for each row execute function set_updated_at();

-- --- RLS HELPERS ---

create or replace function is_org_member(p_org uuid)
returns boolean as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org and m.user_id = auth.uid()
  );
$$ language sql stable security definer;

create or replace function has_org_role(p_org uuid, p_roles text[])
returns boolean as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org
      and m.user_id = auth.uid()
      and m.role = any (p_roles)
  );
$$ language sql stable security definer;

-- --- RLS POLICIES ---

alter table public.orgs enable row level security;
alter table public.profiles enable row level security;
alter table public.org_members enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.kb_articles enable row level security;
alter table public.audit_log enable row level security;

-- Orgs: user sees orgs where is member
create policy orgs_select on public.orgs for select to authenticated
using (exists (select 1 from public.org_members m where m.org_id = public.orgs.id and m.user_id = auth.uid()));

-- Profiles: user sees own or colleagues
create policy profiles_select on public.profiles for select to authenticated
using (id = auth.uid() or exists (
  select 1 from public.org_members m1 
  join public.org_members m2 on m1.org_id = m2.org_id 
  where m1.user_id = auth.uid() and m2.user_id = public.profiles.id
));

-- Org Members
create policy members_select on public.org_members for select to authenticated
using (user_id = auth.uid() or has_org_role(org_id, array['owner','admin','agent']));

-- Tickets
create policy tickets_select on public.tickets for select to authenticated
using (is_org_member(org_id));

create policy tickets_insert on public.tickets for insert to authenticated
with check (is_org_member(org_id) and created_by = auth.uid());

create policy tickets_update on public.tickets for update to authenticated
using (is_org_member(org_id))
with check (has_org_role(org_id, array['owner','admin','agent']) or (created_by = auth.uid() and status <> 'closed'));

-- Ticket Messages
create policy messages_select on public.ticket_messages for select to authenticated
using (is_org_member(org_id) and (kind = 'public_reply' or has_org_role(org_id, array['owner','admin','agent'])));

create policy messages_insert on public.ticket_messages for insert to authenticated
with check (is_org_member(org_id) and author_id = auth.uid());

-- KB Articles
create policy kb_select_public on public.kb_articles for select to anon using (is_public = true);
create policy kb_select_auth on public.kb_articles for select to authenticated using (is_org_member(org_id));
create policy kb_write on public.kb_articles for all to authenticated using (has_org_role(org_id, array['owner','admin','agent']));
