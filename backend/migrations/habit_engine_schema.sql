-- Part A — Add three missing columns to profiles
alter table profiles
  add column if not exists
    streak_count integer default 0,
  add column if not exists
    last_checkin_at timestamptz,
  add column if not exists
    email_preferences jsonb default '{
      "weekly_digest": true,
      "milestone_alerts": true,
      "checkin_reminders": true,
      "streak_reminders": true,
      "anomaly_alerts": true
    }'::jsonb;

-- Part B — Create engagement_events table
create table if not exists engagement_events (
  id          uuid primary key
              default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  event_type  text not null,
  channel     text not null default 'email',
  metadata    jsonb default '{}',
  sent_at     timestamptz default now()
);

create index if not exists eng_events_user_idx
  on engagement_events(user_id, event_type);

create index if not exists eng_events_time_idx
  on engagement_events(sent_at desc);

alter table engagement_events
  enable row level security;

create policy "users view own engagement events"
  on engagement_events for select
  using (auth.uid() = user_id);

-- Part C — Create RPC: get_paid_users_for_digest
create or replace function get_paid_users_for_digest()
returns table (
  id                uuid,
  email             text,
  full_name         text,
  company_name      text,
  current_mrr       numeric,
  growth_rate       numeric,
  stage             text,
  streak_count      integer,
  email_preferences jsonb
)
language plpgsql security definer as $$
declare
  has_company_name boolean;
  company_expr text;
begin
  -- Some DBs may not have `profiles.company_name` yet; avoid referencing missing columns.
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'company_name'
  ) into has_company_name;

  if has_company_name then
    company_expr := 'coalesce(p.company_name, p.company, ''your company'')';
  else
    company_expr := 'coalesce(p.company, ''your company'')';
  end if;

  return query execute format(
    'select
      p.id,
      u.email,
      coalesce(p.name, ''Founder'') as full_name,
      %s as company_name,
      coalesce(p.current_mrr, 0) as current_mrr,
      coalesce(p.growth_rate, 0.08) as growth_rate,
      coalesce(p.stage, ''seed'') as stage,
      coalesce(p.streak_count, 0) as streak_count,
      coalesce(p.email_preferences, ''{"weekly_digest": true}''::jsonb) as email_preferences
    from profiles p
    join auth.users u on u.id = p.id
    join subscriptions s on s.user_id = p.id
    where s.status in (''active'', ''trialing'')
      and s.plan in (''starter'',''founder'',''studio'',''vc_portfolio'')
      and coalesce(p.current_mrr, 0) > 0',
    company_expr
  );
end;
$$;

-- Part D — Create RPC: get_cohort_percentile
create or replace function get_cohort_percentile(
  p_growth_rate numeric,
  p_stage       text
)
returns integer
language sql security definer as $$
  select coalesce(
    (
      select
        round(
          count(*) filter (
            where coalesce(growth_rate, 0)
                  < p_growth_rate
          )::numeric
          / nullif(count(*)::numeric, 0) * 100
        )::integer
      from profiles
      where coalesce(stage, 'seed') = p_stage
        and growth_rate is not null
    ),
    50
  );
$$;

-- Part E — Create RPC: get_cohort_size
create or replace function get_cohort_size(
  p_stage text
)
returns integer
language sql security definer as $$
  select count(*)::integer
  from profiles
  where coalesce(stage, 'seed') = p_stage
    and growth_rate is not null;
$$;

