-- Drop the column if it exists and recreate it to ensure sequence is fresh
ALTER TABLE public.orders DROP COLUMN IF EXISTS order_number;
ALTER TABLE public.orders ADD COLUMN order_number SERIAL;

-- Ensure permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT ON public.orders TO anon;
