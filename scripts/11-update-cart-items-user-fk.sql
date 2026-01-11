-- Drop the existing foreign key constraint
ALTER TABLE cart_items
DROP CONSTRAINT cart_items_user_id_fkey;

-- Add a new foreign key constraint referencing customer_accounts
ALTER TABLE cart_items
ADD CONSTRAINT cart_items_user_id_fkey
FOREIGN KEY (user_id) REFERENCES customer_accounts(id) ON DELETE CASCADE;