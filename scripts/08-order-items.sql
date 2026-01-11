CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variation_id UUID REFERENCES product_variations(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Authenticated users can view their own order items."
ON order_items FOR SELECT
TO authenticated
USING (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);

CREATE POLICY "Authenticated users can insert their own order items."
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can update their own order items."
ON order_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can delete their own order items."
ON order_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM orders
    WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()
  )
);

-- Staff (admin, logistics) can see all order items
CREATE POLICY "Staff can see all order items" ON order_items FOR SELECT
USING (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));