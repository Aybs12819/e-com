ALTER TABLE orders
ALTER COLUMN shipping_address TYPE jsonb USING shipping_address::jsonb;