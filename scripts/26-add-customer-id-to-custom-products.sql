-- Add customer_id column to custom_products table
ALTER TABLE public.custom_products
ADD COLUMN customer_id uuid null;

-- Add foreign key constraint
ALTER TABLE public.custom_products
ADD CONSTRAINT custom_products_customer_id_fkey FOREIGN KEY (customer_id) 
REFERENCES public.customer_accounts (id) ON DELETE SET NULL;