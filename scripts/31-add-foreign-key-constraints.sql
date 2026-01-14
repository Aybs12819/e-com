ALTER TABLE deliveries
ADD CONSTRAINT deliveries_order_fk
FOREIGN KEY (order_id)
REFERENCES orders(id);

ALTER TABLE deliveries
ADD CONSTRAINT deliveries_custom_product_fk
FOREIGN KEY (custom_product_id)
REFERENCES custom_products(id);

ALTER TABLE orders
ADD CONSTRAINT orders_customer_fk
FOREIGN KEY (customer_id)
REFERENCES customer_accounts(id);

ALTER TABLE custom_products
ADD CONSTRAINT custom_products_customer_fk
FOREIGN KEY (customer_id)
REFERENCES customer_accounts(id);