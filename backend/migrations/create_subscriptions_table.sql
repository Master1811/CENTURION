-- INSTRUCTIONS: Run this SQL in your Supabase
-- project SQL editor before starting the server.
-- Dashboard → SQL Editor → New query → paste → Run

-- Run this in Supabase SQL editor
-- Project: Centurion 100Cr Engine

create table if not exists subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  plan        text not null default 'free',
  status      text not null default 'active',
  payment_ref text unique,
  expires_at  timestamptz,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table subscriptions enable row level security;

create policy "users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create index if not exists 
  subscriptions_user_id_idx on subscriptions(user_id);

create index if not exists 
  subscriptions_payment_ref_idx 
  on subscriptions(payment_ref);

-- Note: only service role can insert/update
-- Frontend reads via /api/user/profile endpoint

