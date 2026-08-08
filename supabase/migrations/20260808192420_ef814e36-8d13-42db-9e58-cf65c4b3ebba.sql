-- Re-apply policies with clean structure for admin restriction
-- Categorias
DROP POLICY IF EXISTS "Admins can do everything on categories" ON public.categories;
CREATE POLICY "Admins can do everything on categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Produtos
DROP POLICY IF EXISTS "Admins can do everything on products" ON public.products;
CREATE POLICY "Admins can do everything on products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Acréscimos
DROP POLICY IF EXISTS "Admins can do everything on additions" ON public.additions;
CREATE POLICY "Admins can do everything on additions" ON public.additions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Store Config
DROP POLICY IF EXISTS "Admins can do everything on store_config" ON public.store_config;
CREATE POLICY "Admins can do everything on store_config" ON public.store_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders
DROP POLICY IF EXISTS "Admins can do everything on orders" ON public.orders;
CREATE POLICY "Admins can do everything on orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Users can see their own orders" ON public.orders;
CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Order Items
DROP POLICY IF EXISTS "Admins can do everything on order_items" ON public.order_items;
CREATE POLICY "Admins can do everything on order_items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Order Item Additions
DROP POLICY IF EXISTS "Admins can do everything on order_item_additions" ON public.order_item_additions;
CREATE POLICY "Admins can do everything on order_item_additions" ON public.order_item_additions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
