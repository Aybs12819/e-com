ALTER TABLE public.custom_products
ADD COLUMN rider_id UUID NULL;

ALTER TABLE public.custom_products
ADD CONSTRAINT custom_products_rider_id_fkey
FOREIGN KEY (rider_id) REFERENCES public.profiles(id) ON DELETE SET NULL;