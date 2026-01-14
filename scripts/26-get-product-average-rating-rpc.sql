DROP FUNCTION IF EXISTS get_product_average_rating(uuid);

CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id uuid)
RETURNS TABLE(average_rating numeric, review_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS average_rating,
    COUNT(r.id) AS review_count
  FROM reviews r
  WHERE r.product_id = p_product_id;
END;
$$;