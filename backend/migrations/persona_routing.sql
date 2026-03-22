-- Already run in Supabase on 2026-03-22
-- Adding here for record keeping only
-- DO NOT run again — column already exists

alter table profiles
  add column if not exists business_model text
  check (business_model in ('saas', 'agency'))
  default null;

create index if not exists
  profiles_business_model_idx
  on profiles(business_model);

-- Columns referenced in code but missing from migrations
alter table profiles
  add column if not exists full_name text,
  add column if not exists company_name text,
  add column if not exists stage text,
  add column if not exists sector text,
  add column if not exists current_mrr numeric,
  add column if not exists growth_rate numeric,
  add column if not exists website text;
