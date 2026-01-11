DROP FUNCTION IF EXISTS create_order(uuid, numeric, text, text[]);

CREATE OR REPLACE FUNCTION create_order(
    customer_id uuid,
    total_amount numeric,
    shipping_address text,
    cart_item_ids text[], -- Change input type to text[]
    p_shipping_fee numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    order_id uuid;
    cart_item record;
    valid_cart_item_uuids uuid[]; -- New variable to store valid UUIDs
    current_cart_item_id text;
BEGIN
    -- Initialize the array
    valid_cart_item_uuids := ARRAY[]::uuid[];

    -- Iterate through the input cart_item_ids (as text) and validate/cast them
    FOREACH current_cart_item_id IN ARRAY cart_item_ids
    LOOP
        IF current_cart_item_id IS NOT NULL AND current_cart_item_id != '' THEN
            BEGIN
                -- Attempt to cast to UUID, if it fails, it's not a valid UUID
                valid_cart_item_uuids := array_append(valid_cart_item_uuids, current_cart_item_id::uuid);
            EXCEPTION WHEN OTHERS THEN
                -- Log the invalid UUID and continue
                -- RAISE NOTICE 'Skipping invalid cart_item_id: %', current_cart_item_id;
            END;
        END IF;
    END LOOP;

    -- If no valid cart items, we should probably handle this, e.g., raise an error or return NULL
    IF array_length(valid_cart_item_uuids, 1) IS NULL THEN
        RAISE EXCEPTION 'No valid cart items provided for order creation.';
    END IF;

    -- Create the order
    INSERT INTO orders (customer_id, total_amount, shipping_address, status, shipping_fee)
    VALUES (customer_id, total_amount, shipping_address, 'pending', p_shipping_fee)
    RETURNING id INTO order_id;

    -- Move cart items to order items
    FOR cart_item IN
        SELECT ci.product_id, ci.quantity, ci.price, ci.variation_id::text as variation_id_text -- Cast to text here
        FROM cart_items ci
        WHERE ci.id = ANY(valid_cart_item_uuids) AND ci.user_id = customer_id
    LOOP
        INSERT INTO order_items (order_id, product_id, quantity, price, variation_id)
        VALUES (
            order_id,
            cart_item.product_id,
            cart_item.quantity,
            cart_item.price,
            CASE
                WHEN cart_item.variation_id_text IS NOT NULL AND cart_item.variation_id_text != '' THEN cart_item.variation_id_text::uuid
                ELSE NULL
            END
        );
    END LOOP;

    -- Clear cart items
    DELETE FROM cart_items
    WHERE id = ANY(valid_cart_item_uuids) AND user_id = customer_id;

    RETURN order_id;
END;
$$;