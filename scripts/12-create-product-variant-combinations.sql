CREATE TABLE product_variant_combinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    combination TEXT NOT NULL UNIQUE,
    price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE product_variant_combinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public product variant combinations are viewable by everyone."
ON product_variant_combinations FOR SELECT
USING (true);