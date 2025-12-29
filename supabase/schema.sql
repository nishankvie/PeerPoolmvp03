-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Availability blocks table
create table public.availability_blocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  status text check (status in ('available', 'busy', 'maybe')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hangouts table
create table public.hangouts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text check (status in ('planning', 'confirmed', 'cancelled', 'completed')) default 'planning',
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hangout participants table
create table public.hangout_participants (
  id uuid default uuid_generate_v4() primary key,
  hangout_id uuid references public.hangouts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('invited', 'accepted', 'declined', 'maybe')) default 'invited',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(hangout_id, user_id)
);

-- Friendships table
create table public.friendships (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  friend_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id),
  check (user_id != friend_id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.hangouts enable row level security;
alter table public.hangout_participants enable row level security;
alter table public.friendships enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Availability blocks policies
create policy "Users can view own availability"
  on availability_blocks for select
  using (auth.uid() = user_id);

create policy "Users can view friends' availability"
  on availability_blocks for select
  using (
    exists (
      select 1 from friendships
      where (user_id = auth.uid() and friend_id = availability_blocks.user_id and status = 'accepted')
    )
  );

create policy "Users can insert own availability"
  on availability_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own availability"
  on availability_blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete own availability"
  on availability_blocks for delete
  using (auth.uid() = user_id);

-- Hangouts policies
create policy "Public hangouts are viewable by everyone"
  on hangouts for select
  using (is_public = true);

create policy "Participants can view private hangouts"
  on hangouts for select
  using (
    auth.uid() = creator_id or
    exists (
      select 1 from hangout_participants
      where hangout_id = hangouts.id and user_id = auth.uid()
    )
  );

create policy "Users can create hangouts"
  on hangouts for insert
  with check (auth.uid() = creator_id);

create policy "Creators can update own hangouts"
  on hangouts for update
  using (auth.uid() = creator_id);

create policy "Creators can delete own hangouts"
  on hangouts for delete
  using (auth.uid() = creator_id);

-- Hangout participants policies
create policy "Participants can view hangout participants"
  on hangout_participants for select
  using (
    exists (
      select 1 from hangouts
      where id = hangout_participants.hangout_id
        and (creator_id = auth.uid() or is_public = true)
    )
    or user_id = auth.uid()
  );

create policy "Hangout creators can add participants"
  on hangout_participants for insert
  with check (
    exists (
      select 1 from hangouts
      where id = hangout_id and creator_id = auth.uid()
    )
  );

create policy "Users can update own participation status"
  on hangout_participants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Friendships policies
create policy "Users can view own friendships"
  on friendships for select
  using (auth.uid() = user_id or auth.uid() = friend_id);

create policy "Users can create friendships"
  on friendships for insert
  with check (auth.uid() = user_id);

create policy "Users can update own friendships"
  on friendships for update
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at triggers
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.availability_blocks
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.hangouts
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.hangout_participants
  for each row execute procedure public.handle_updated_at();

create trigger set_updated_at before update on public.friendships
  for each row execute procedure public.handle_updated_at();

-- Indexes for better query performance
create index availability_blocks_user_id_idx on public.availability_blocks(user_id);
create index availability_blocks_start_time_idx on public.availability_blocks(start_time);
create index hangouts_creator_id_idx on public.hangouts(creator_id);
create index hangouts_status_idx on public.hangouts(status);
create index hangout_participants_hangout_id_idx on public.hangout_participants(hangout_id);
create index hangout_participants_user_id_idx on public.hangout_participants(user_id);
create index friendships_user_id_idx on public.friendships(user_id);
create index friendships_friend_id_idx on public.friendships(friend_id);
create index friendships_status_idx on public.friendships(status);

