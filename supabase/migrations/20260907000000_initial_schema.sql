create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  email text not null unique,
  daily_goal integer not null default 64 check (daily_goal between 8 and 300),
  created_at timestamptz not null default now()
);

create table public.water_entries (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_oz numeric(6,1) not null check (amount_oz > 0 and amount_oz <= 200),
  created_at timestamptz not null default now()
);
create index water_entries_user_created_idx on public.water_entries(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.water_entries enable row level security;
create policy "users can view their profile" on public.profiles for select to authenticated using (auth.uid() = id);
create function public.list_team_progress()
returns table (id uuid, display_name text, daily_goal integer)
language sql security definer set search_path = '' stable as $$
  select p.id, p.display_name, p.daily_goal from public.profiles p order by p.created_at;
$$;
revoke all on function public.list_team_progress() from public;
grant execute on function public.list_team_progress() to authenticated;

create policy "users can update their profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "authenticated teammates can view entries" on public.water_entries for select to authenticated using (true);
create policy "users can add their entries" on public.water_entries for insert to authenticated with check (auth.uid() = user_id);
create policy "users can undo their entries" on public.water_entries for delete to authenticated using (auth.uid() = user_id);

create function public.create_profile_for_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, email, daily_goal)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)), new.email, coalesce((new.raw_user_meta_data ->> 'daily_goal')::integer, 64));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

alter publication supabase_realtime add table public.water_entries;
