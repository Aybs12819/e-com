-- 1. Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references profiles(id) on delete set null,
  total_amount decimal(12,2) not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Deliveries Table (Logistics Assignment)
create table deliveries (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  rider_id uuid references profiles(id) on delete set null,
  head_logistics_id uuid references profiles(id) on delete set null,
  status text check (status in ('assigned', 'out_for_delivery', 'delivered', 'failed')) default 'assigned',
  tracking_number text unique,
  estimated_delivery timestamp with time zone,
  actual_delivery timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RLS Policies for Logistics
alter table orders enable row level security;
alter table deliveries enable row level security;

-- Admins and Logistics can see all orders/deliveries
create policy "Staff can see all orders" on orders for select 
using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

create policy "Staff can see all deliveries" on deliveries for select 
using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

-- Riders can see their assigned deliveries
create policy "Riders can see assigned deliveries" on deliveries for select
using (rider_id = auth.uid());
