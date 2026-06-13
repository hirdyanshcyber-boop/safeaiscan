-- SafeAI Scan — Supabase schema for the shared live counter.
-- Run once in the Supabase SQL editor.

create table if not exists assessments (
  id          bigint generated always as identity primary key,
  overall     int    not null,
  grade       text,
  leaks_data  boolean default false,
  created_at  timestamptz default now()
);

-- Allow anonymous inserts (anon key) but never reads of raw rows.
alter table assessments enable row level security;

create policy "anon insert" on assessments
  for insert to anon with check (true);

-- Aggregate-only RPC the front end calls for the live counter.
create or replace function get_benchmark()
returns table (count bigint, leak_pct int)
language sql security definer as $$
  select
    count(*)::bigint,
    coalesce(round(100.0 * count(*) filter (where leaks_data) / nullif(count(*),0)))::int
  from assessments;
$$;

grant execute on function get_benchmark() to anon;
