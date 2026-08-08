TRUNCATE TABLE public.order_item_additions CASCADE;
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
ALTER SEQUENCE public.orders_order_number_seq RESTART WITH 1;
