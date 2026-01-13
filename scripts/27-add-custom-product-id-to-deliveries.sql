-- Add custom_product_id column to deliveries table
ALTER TABLE public.deliveries
ADD COLUMN custom_product_id uuid null;

-- Add foreign key constraint
ALTER TABLE public.deliveries
ADD CONSTRAINT deliveries_custom_product_id_fkey FOREIGN KEY (custom_product_id)
REFERENCES public.custom_products (id) ON DELETE CASCADE;

-- Add constraint to ensure either order_id or custom_product_id is set, but not both
ALTER TABLE public.deliveries
ADD CONSTRAINT deliveries_order_or_custom_product_check
CHECK (
  (order_id IS NOT NULL AND custom_product_id IS NULL) OR
  (order_id IS NULL AND custom_product_id IS NOT NULL)
);