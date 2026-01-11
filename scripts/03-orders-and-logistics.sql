DROP TABLE IF EXISTS orders CASCADE;
-- 1. Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customer_accounts(id) on delete set null,
  total_amount decimal(12,2) not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  shipping_address jsonb not null,
  shipping_fee decimal(12,2) default 0.00 not null,
  rider_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

DROP TABLE IF EXISTS deliveries CASCADE;
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
-- alter table orders enable row level security;
alter table orders disable row level security;
alter table deliveries enable row level security;

-- Admins and Logistics can see all orders/deliveries
create policy "Staff can see all orders" on orders for select 
using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

DROP POLICY IF EXISTS "Staff can see all deliveries" ON deliveries;
create policy "Staff can see all deliveries" on deliveries for select 
using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

create policy "Staff can insert deliveries" on deliveries for insert
with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

-- Users can create their own orders
-- Users can create their own orders
DROP POLICY IF EXISTS "Customers can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
create policy "Users can create their own orders" on orders for insert
with check (customer_id = auth.uid() AND customer_id IS NOT NULL);

-- Allow customers to SELECT their own orders
DROP POLICY IF EXISTS "Customers can see their own orders" ON orders;
CREATE POLICY "Customers can see their own orders"
ON orders
FOR SELECT
USING (customer_id = auth.uid());

-- Riders can see orders assigned to them
DROP POLICY IF EXISTS "Riders can see assigned orders" ON orders;
CREATE POLICY "Riders can see assigned orders"
ON orders
FOR SELECT
USING (rider_id = auth.uid());

-- Staff can update orders (e.g., assign rider, update status)
DROP POLICY IF EXISTS "Staff can update orders" ON orders;
CREATE POLICY "Staff can update orders"
ON orders
FOR UPDATE
USING (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')))
WITH CHECK (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));

-- RLS Policies for order_items
alter table order_items enable row level security;

DROP POLICY IF EXISTS "Users can create their own order items" ON order_items;
DROP POLICY IF EXISTS "Customers can insert their own order items" ON order_items;
create policy "Users can create their own order items" on order_items for insert
with check (true);

-- Riders can see their assigned deliveries
create policy "Riders can see assigned deliveries" on deliveries for select
using (rider_id = auth.uid());
