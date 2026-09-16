create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.darshan_schedule (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  time_text text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  date_label text not null default '',
  description text not null default '',
  image_url text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null default '',
  caption text not null default '',
  category text not null default 'Temple',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.youtube_items (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default '',
  kind text not null check (kind in ('live', 'video', 'short')),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_settings (
  id uuid primary key default gen_random_uuid(),
  youtube_channel_url text not null default '',
  instagram_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  email text not null default '',
  enquiry_type text not null default 'General',
  message text not null,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public)
values ('temple-gallery', 'temple-gallery', true)
on conflict (id) do update set public = true;

create or replace function public.is_temple_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where id = auth.uid());
$$;

grant usage on schema public to anon, authenticated;
grant select on public.site_settings, public.announcements, public.darshan_schedule, public.events, public.gallery, public.youtube_items, public.social_settings to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, insert, update, delete on public.admin_users, public.site_settings, public.announcements, public.darshan_schedule, public.events, public.gallery, public.youtube_items, public.social_settings, public.enquiries to authenticated;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.announcements enable row level security;
alter table public.darshan_schedule enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.youtube_items enable row level security;
alter table public.social_settings enable row level security;
alter table public.enquiries enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select using (true);
drop policy if exists "admin manage settings" on public.site_settings;
create policy "admin manage settings" on public.site_settings for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements" on public.announcements for select using (is_published = true);
drop policy if exists "admin manage announcements" on public.announcements;
create policy "admin manage announcements" on public.announcements for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read schedule" on public.darshan_schedule;
create policy "public read schedule" on public.darshan_schedule for select using (is_published = true);
drop policy if exists "admin manage schedule" on public.darshan_schedule;
create policy "admin manage schedule" on public.darshan_schedule for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select using (is_published = true);
drop policy if exists "admin manage events" on public.events;
create policy "admin manage events" on public.events for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery for select using (is_published = true);
drop policy if exists "admin manage gallery" on public.gallery;
create policy "admin manage gallery" on public.gallery for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read video" on public.youtube_items;
create policy "public read video" on public.youtube_items for select using (is_published = true);
drop policy if exists "admin manage video" on public.youtube_items;
create policy "admin manage video" on public.youtube_items for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "public read social" on public.social_settings;
create policy "public read social" on public.social_settings for select using (true);
drop policy if exists "admin manage social" on public.social_settings;
create policy "admin manage social" on public.social_settings for all to authenticated using (public.is_temple_admin()) with check (public.is_temple_admin());

drop policy if exists "visitor create enquiry" on public.enquiries;
create policy "visitor create enquiry" on public.enquiries for insert with check (char_length(name) between 1 and 120 and char_length(message) between 1 and 4000);
drop policy if exists "admin read enquiry" on public.enquiries;
create policy "admin read enquiry" on public.enquiries for select to authenticated using (public.is_temple_admin());
drop policy if exists "admin delete enquiry" on public.enquiries;
create policy "admin delete enquiry" on public.enquiries for delete to authenticated using (public.is_temple_admin());

drop policy if exists "admin view accounts" on public.admin_users;
create policy "admin view accounts" on public.admin_users for select to authenticated using (public.is_temple_admin());

drop policy if exists "public view temple images" on storage.objects;
create policy "public view temple images" on storage.objects for select using (bucket_id = 'temple-gallery');
drop policy if exists "admin manage temple images" on storage.objects;
create policy "admin manage temple images" on storage.objects for all to authenticated using (bucket_id = 'temple-gallery' and public.is_temple_admin()) with check (bucket_id = 'temple-gallery' and public.is_temple_admin());

-- After creating the first Supabase Auth user, run this once with that user's UUID:
-- insert into public.admin_users (id) values ('PASTE_AUTH_USER_UUID_HERE');
