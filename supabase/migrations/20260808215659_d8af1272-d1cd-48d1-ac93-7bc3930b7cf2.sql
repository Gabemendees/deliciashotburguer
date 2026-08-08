ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number SERIAL;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT ON public.orders TO anon;
