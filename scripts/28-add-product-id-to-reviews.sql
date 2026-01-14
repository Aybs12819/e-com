ALTER TABLE reviews
ADD COLUMN product_id uuid REFERENCES products(id);