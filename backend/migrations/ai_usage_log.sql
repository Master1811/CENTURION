-- Migration: ai_usage_log table
-- Run this in Supabase SQL editor before restarting the backend.
-- Safe to run multiple times (all statements use IF NOT EXISTS).

create table if not exists ai_usage_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  feature       text not null,
  model         text not null,
  input_tokens  integer default 0,
  output_tokens integer default 0,
  cost_inr      numeric(10,4) default 0,
  created_at    timestamptz default now()
);

create index if not exists ai_usage_log_user_month_idx
  on ai_usage_log(user_id, created_at desc);

alter table ai_usage_log enable row level security;

-- Users can read their own usage; backend writes via service role key (bypasses RLS).
create policy "users view own ai usage"
  on ai_usage_log for select
  using (auth.uid() = user_id);
