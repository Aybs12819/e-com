CREATE OR REPLACE FUNCTION get_product_sold_count(p_product_id uuid)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
    sold_count bigint;
BEGIN
    RAISE NOTICE 'get_product_sold_count called with p_product_id: %', p_product_id;
    SELECT SUM(oi.quantity)
    INTO sold_count
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE oi.product_id = p_product_id AND o.status = 'delivered';

    RETURN COALESCE(sold_count, 0);
END;
$$;