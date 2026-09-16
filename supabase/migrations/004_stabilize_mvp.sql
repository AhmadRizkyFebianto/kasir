-- MVP POS walk-in orders do not always have a registered customer.
ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;
