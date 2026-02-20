-- Run this in your Supabase SQL Editor to create the necessary table and policies

create table if not exists user_data (
  user_id uuid references auth.users not null primary key,
  data jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_data enable row level security;

create policy "Users can select their own data" 
  on user_data for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own data" 
  on user_data for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own data" 
  on user_data for update 
  using (auth.uid() = user_id);
