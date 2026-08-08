-- 1. Private schema for security-definer helper (not exposed via Data API)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Drop policies depending on public.has_role
DROP POLICY IF EXISTS "Admin all additions" ON public.additions;
DROP POLICY IF EXISTS "Admins can do everything on additions" ON public.additions;
DROP POLICY IF EXISTS "Admin all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
DROP POLICY IF EXISTS "Admin all products" ON public.products;
DROP POLICY IF EXISTS "Admins can do everything on products" ON public.products;
DROP POLICY IF EXISTS "Admin all store_config" ON public.store_config;
DROP POLICY IF EXISTS "Admins can do everything on store_config" ON public.store_config;
DROP POLICY IF EXISTS "Admin all user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can do everything on orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admin all order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can do everything on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order_items" ON public.order_items;
DROP POLICY IF EXISTS "Users can see their own order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admin all order_item_additions" ON public.order_item_additions;
DROP POLICY IF EXISTS "Admins can do everything on order_item_additions" ON public.order_item_additions;
DROP POLICY IF EXISTS "Users can create order_item_additions" ON public.order_item_additions;
DROP POLICY IF EXISTS "Users can see their own order_item_additions" ON public.order_item_additions;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 3. Recreate admin policies using private.has_role
CREATE POLICY "Admin all additions" ON public.additions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin all categories" ON public.categories FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin all products" ON public.products FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin all store_config" ON public.store_config FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin all user_roles" ON public.user_roles FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- 4. Orders: no public inserts. Only service role (server) writes.
CREATE POLICY "Admin all orders" ON public.orders FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin all order_items" ON public.order_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can see their own order_items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

CREATE POLICY "Admin all order_item_additions" ON public.order_item_additions FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can see their own order_item_additions" ON public.order_item_additions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_additions.order_item_id AND o.user_id = auth.uid()
  ));

-- 5. Remove write privileges from anonymous visitors on order tables
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.order_item_additions FROM anon;
REVOKE SELECT ON public.orders FROM anon;
REVOKE SELECT ON public.order_items FROM anon;
REVOKE SELECT ON public.order_item_additions FROM anon;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.order_item_additions TO service_role;