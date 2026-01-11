-- 4. Customer Accounts Table
create table customer_accounts (
  id uuid references auth.users on delete cascade primary key,
  first_name text not null,
  middle_name text,
  last_name text not null,
  birthdate date,
  address text,
  email text unique,
  phone text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for customer_accounts
alter table customer_accounts enable row level security;

create policy "Customers can view their own account" on customer_accounts for select using (auth.uid() = id);
create policy "Customers can update their own account" on customer_accounts for update using (auth.uid() = id);
create policy "Customers can insert their own account" on customer_accounts for insert with check (auth.uid() = id);