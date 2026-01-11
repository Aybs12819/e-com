UPDATE order_items
SET variation_id = NULL
WHERE variation_id::text = '';