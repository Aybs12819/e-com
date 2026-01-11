-- Drop the existing foreign key constraint on cart_items.variation_id
ALTER TABLE cart_items
DROP CONSTRAINT IF EXISTS cart_items_variation_id_fkey;

-- Ensure variation_id column is of type UUID (if not already) and allow NULLs
ALTER TABLE cart_items
ALTER COLUMN variation_id TYPE UUID USING variation_id::uuid,
ALTER COLUMN variation_id DROP NOT NULL;