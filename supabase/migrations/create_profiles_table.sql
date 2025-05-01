-- Create the bank_profiles table
create table if not exists public.bank_profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text,
    id_number text unique,
    account_number text unique,
    email text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.bank_profiles enable row level security;

-- Create policies
create policy "Public bank_profiles are viewable by everyone."
    on bank_profiles for select
    using ( true );

create policy "Users can insert their own bank_profile."
    on bank_profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own bank_profile."
    on bank_profiles for update
    using ( auth.uid() = id );

-- Create indexes
create index if not exists bank_profiles_id_number_idx on bank_profiles(id_number);
create index if not exists bank_profiles_account_number_idx on bank_profiles(account_number);
create index if not exists bank_profiles_email_idx on bank_profiles(email); 