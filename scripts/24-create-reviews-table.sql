-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id uuid NOT NULL,
  customer_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer_accounts(id) ON DELETE CASCADE,
  CONSTRAINT reviews_order_customer_unique UNIQUE (order_id, customer_id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Create indexes
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);