ALTER TABLE order_items
ADD COLUMN custom_product_id UUID REFERENCES custom_products(id) ON DELETE CASCADE;

ALTER TABLE order_items
ALTER COLUMN product_id DROP NOT NULL;

-- Add a check constraint to ensure that either product_id or custom_product_id is present, but not both
ALTER TABLE order_items
ADD CONSTRAINT chk_product_type CHECK (
  (product_id IS NOT NULL AND custom_product_id IS NULL) OR
  (product_id IS NULL AND custom_product_id IS NOT NULL)
);