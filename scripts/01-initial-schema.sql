-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Handles all user roles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text unique,
  phone_number text unique,
  role text check (role in ('admin', 'customer', 'logistics', 'rider')) default 'customer',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories Table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  base_price decimal(12,2) not null,
  images text[] default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Product Variations (Size, Color, Type)
create table product_variations (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  variation_name text not null, -- e.g., 'Size', 'Color'
  variation_value text not null, -- e.g., 'Large', 'Blue'
  price_adjustment decimal(12,2) default 0,
  stock_quantity integer default 0,
  sku text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. RLS Policies
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_variations enable row level security;

-- Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone" on profiles for select using (true);

-- Categories are viewable by everyone
create policy "Categories are viewable by everyone" on categories for select using (true);

-- Products are viewable by everyone
create policy "Products are viewable by everyone" on products for select using (is_active = true);

-- Variations are viewable by everyone
create policy "Variations are viewable by everyone" on product_variations for select using (true);

-- Insert Initial Categories
insert into categories (name, slug, description) values
('Handloom and Woven Products', 'handloom-woven', 'Authentic woven crafts from Mapita community'),
('Local Food & Delicacies', 'local-food', 'Homegrown treats and delicacies from Aguilar'),
('Handmade Accessories & Crafts', 'handmade-accessories', 'Artisanal accessories and handcrafted items'),
('Home Décor & Souvenirs', 'home-decor', 'Beautiful home accents and local souvenirs');
