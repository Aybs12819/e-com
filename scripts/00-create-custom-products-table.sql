-- Create Custom Products Table
create table custom_products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  base_price decimal(12,2) not null,
  images text[] default '{}',
  status text default 'Confirmed Order', -- New status column with default value
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for custom_products
alter table custom_products enable row level security;

-- Custom products are viewable by everyone (adjust as needed for specific roles)
create policy "Custom products are viewable by everyone" on custom_products for select using (true);

-- Admins can insert custom products
create policy "Admins can insert custom products" on custom_products for insert with check (auth.uid() in (select id from profiles where role = 'admin'));

-- Admins can update custom products
create policy "Admins can update custom products" on custom_products for update using (auth.uid() in (select id from profiles where role = 'admin'));

-- Admins can delete custom products
create policy "Admins can delete custom products" on custom_products for delete using (auth.uid() in (select id from profiles where role = 'admin'));