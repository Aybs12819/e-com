DROP FUNCTION IF EXISTS get_product_sold_count(uuid);

CREATE OR REPLACE FUNCTION get_product_sold_count(p_product_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(oi.quantity), 0)
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  WHERE oi.product_id = p_product_id
    AND o.status = 'completed';
$$;