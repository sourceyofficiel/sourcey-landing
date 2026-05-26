-- ============================================================
-- Creator Agency — Schéma Supabase
-- À coller dans Supabase SQL Editor en une fois.
-- Idempotent : peut être rejoué pour appliquer des changements.
-- ============================================================

-- ============================================
-- profiles : étend auth.users
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'prospector' check (role in ('admin', 'prospector')),
  daily_target int default 50,
  monthly_salary_cents int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- brands : tes marques e-commerce (UltraKits, Sourcia…)
-- ============================================
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  description text,
  brand_context text,
  created_at timestamptz default now(),
  created_by uuid references public.profiles(id)
);

-- ============================================
-- influencers : base centrale
-- ============================================
create table if not exists public.influencers (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  handle_tiktok text,
  handle_instagram text,
  handle_snapchat text,
  handle_youtube text,
  profile_url text,
  followers_count int default 0,
  size_tier text generated always as (
    case
      when followers_count >= 1000000 then 'mega'
      when followers_count >= 500000  then 'macro'
      when followers_count >= 100000  then 'mid'
      when followers_count >= 10000   then 'micro'
      else 'nano'
    end
  ) stored,
  niche text,
  country text,
  language text default 'fr',
  contact_email text,
  contact_phone text,
  pricing_min_cents int,
  pricing_max_cents int,
  engagement_rate numeric(5,2),
  global_status text default 'lead'
    check (global_status in ('lead','contacted','negotiating','accepted','refused','blacklist')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migration : ajoute handle_snapchat aux DB existantes (idempotent)
alter table public.influencers
  add column if not exists handle_snapchat text;

create index if not exists influencers_size_tier_idx on public.influencers(size_tier);
create index if not exists influencers_niche_idx on public.influencers(niche);
create index if not exists influencers_country_idx on public.influencers(country);
create index if not exists influencers_global_status_idx on public.influencers(global_status);
create index if not exists influencers_snapchat_idx on public.influencers(handle_snapchat);

-- ============================================
-- campaigns
-- ============================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  objective text,
  budget_cents int default 0,
  status text default 'draft' check (status in ('draft','active','paused','completed')),
  start_date date,
  end_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- prospections : influencer × campagne × prospecteur
-- ============================================
create table if not exists public.prospections (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete set null,
  assigned_to uuid references public.profiles(id),
  status text default 'to_contact'
    check (status in ('to_contact','contacted','awaiting_reply','negotiating','accepted','refused','ghosted')),
  channel text,
  first_contacted_at timestamptz,
  last_interaction_at timestamptz,
  agreed_price_cents int,
  expected_deliverables text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (influencer_id, campaign_id)
);

create index if not exists prospections_assigned_to_idx on public.prospections(assigned_to);
create index if not exists prospections_status_idx on public.prospections(status);

-- ============================================
-- prospection_messages : historique d'échanges
-- ============================================
create table if not exists public.prospection_messages (
  id uuid primary key default gen_random_uuid(),
  prospection_id uuid not null references public.prospections(id) on delete cascade,
  author_id uuid references public.profiles(id),
  direction text not null check (direction in ('sent','received')),
  channel text not null,
  subject text,
  body text not null,
  sent_at timestamptz default now()
);

-- ============================================
-- message_templates
-- ============================================
create table if not exists public.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null,
  subject text,
  body text not null,
  brand_id uuid references public.brands(id) on delete set null,
  is_shared boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- ai_analyses : cache des analyses IA par (influenceur × marque)
-- ============================================
create table if not exists public.ai_analyses (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.influencers(id) on delete cascade,
  target_brand_id uuid references public.brands(id) on delete cascade,
  detected_niche text,
  estimated_engagement_rate numeric(5,2),
  audience_age jsonb,
  audience_gender jsonb,
  audience_country jsonb,
  profitability_score int check (profitability_score between 0 and 100),
  recommendation text check (recommendation in ('priority','contact','avoid')),
  reasoning text,
  raw_response jsonb,
  model text,
  input_tokens int,
  output_tokens int,
  created_at timestamptz default now()
);

create index if not exists ai_analyses_lookup_idx
  on public.ai_analyses(influencer_id, target_brand_id);

-- ============================================
-- invitations
-- ============================================
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'prospector',
  token text not null unique,
  invited_by uuid references public.profiles(id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- activity_log
-- ============================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists activity_log_user_action_date_idx
  on public.activity_log(user_id, action, created_at);

-- ============================================
-- Vue leaderboard (30 derniers jours)
-- ============================================
create or replace view public.leaderboard_30d as
select
  p.id,
  p.full_name,
  p.avatar_url,
  count(*) filter (where al.action = 'prospection.contact') as contacted_count,
  count(*) filter (where al.action = 'prospection.accept')  as accepted_count,
  case when count(*) filter (where al.action = 'prospection.contact') > 0
       then round(100.0 * count(*) filter (where al.action = 'prospection.accept')
              / count(*) filter (where al.action = 'prospection.contact'), 1)
       else 0
  end as conversion_rate
from profiles p
left join activity_log al on al.user_id = p.id
  and al.created_at > now() - interval '30 days'
where p.role = 'prospector' and p.is_active
group by p.id, p.full_name, p.avatar_url
order by contacted_count desc;

-- ============================================
-- RLS
-- ============================================
alter table profiles            enable row level security;
alter table brands              enable row level security;
alter table influencers         enable row level security;
alter table campaigns           enable row level security;
alter table prospections        enable row level security;
alter table prospection_messages enable row level security;
alter table message_templates   enable row level security;
alter table ai_analyses         enable row level security;
alter table invitations         enable row level security;
alter table activity_log        enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and is_active
  );
$$;

-- Drop & recreate policies (idempotent)
-- NOTE : pour les policies "for all" qui doivent permettre l'INSERT, il faut
-- absolument ajouter "with check" en plus de "using" (Postgres refuse l'INSERT
-- par défaut si seul "using" est défini).
drop policy if exists "profiles_self_read"  on profiles;
drop policy if exists "profiles_self_write" on profiles;
drop policy if exists "profiles_admin_all"  on profiles;
create policy "profiles_self_read"  on profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_self_write" on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_admin_all"  on profiles for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands_read"        on brands;
drop policy if exists "brands_admin_write" on brands;
create policy "brands_read"        on brands for select using (auth.uid() is not null);
create policy "brands_admin_write" on brands for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "influencers_all" on influencers;
create policy "influencers_all" on influencers for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "campaigns_read"        on campaigns;
drop policy if exists "campaigns_admin_write" on campaigns;
create policy "campaigns_read"        on campaigns for select using (auth.uid() is not null);
create policy "campaigns_admin_write" on campaigns for all    using (public.is_admin()) with check (public.is_admin());

drop policy if exists "prospections_own" on prospections;
create policy "prospections_own" on prospections for all
  using (assigned_to = auth.uid() or public.is_admin())
  with check (assigned_to = auth.uid() or public.is_admin());

drop policy if exists "messages_by_prospection" on prospection_messages;
create policy "messages_by_prospection" on prospection_messages for all
  using (
    exists(select 1 from prospections p where p.id = prospection_id
           and (p.assigned_to = auth.uid() or public.is_admin()))
  )
  with check (
    exists(select 1 from prospections p where p.id = prospection_id
           and (p.assigned_to = auth.uid() or public.is_admin()))
  );

drop policy if exists "ai_read"   on ai_analyses;
drop policy if exists "ai_insert" on ai_analyses;
create policy "ai_read"   on ai_analyses for select using (auth.uid() is not null);
create policy "ai_insert" on ai_analyses for insert with check (auth.uid() is not null);

drop policy if exists "tpl_read"  on message_templates;
drop policy if exists "tpl_write" on message_templates;
create policy "tpl_read"  on message_templates for select
  using (is_shared = true or created_by = auth.uid() or public.is_admin());
create policy "tpl_write" on message_templates for all
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "inv_admin" on invitations;
create policy "inv_admin" on invitations for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "act_read"   on activity_log;
drop policy if exists "act_insert" on activity_log;
create policy "act_read"   on activity_log for select using (user_id = auth.uid() or public.is_admin());
create policy "act_insert" on activity_log for insert with check (user_id = auth.uid());

-- ============================================
-- Trigger : crée automatiquement une ligne profiles
-- quand un user est créé dans auth.users
-- ============================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    'prospector'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
