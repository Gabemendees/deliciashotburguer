-- Categories
DO $$ BEGIN
    CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
    CREATE POLICY "Admin all categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Products
DO $$ BEGIN
    CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
    CREATE POLICY "Admin all products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Additions
DO $$ BEGIN
    CREATE POLICY "Public read additions" ON public.additions FOR SELECT USING (true);
    CREATE POLICY "Admin all additions" ON public.additions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Store Config
DO $$ BEGIN
    CREATE POLICY "Public read store_config" ON public.store_config FOR SELECT USING (true);
    CREATE POLICY "Admin all store_config" ON public.store_config FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Orders
DO $$ BEGIN
    CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can see their own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Admin all orders" ON public.orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Order Items
DO $$ BEGIN
    CREATE POLICY "Users can create order_items" ON public.order_items FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can see their own order_items" ON public.order_items FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE id = order_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
        )
    );
    CREATE POLICY "Admin all order_items" ON public.order_items FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Order Item Additions
DO $$ BEGIN
    CREATE POLICY "Users can create order_item_additions" ON public.order_item_additions FOR INSERT WITH CHECK (true);
    CREATE POLICY "Users can see their own order_item_additions" ON public.order_item_additions FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.order_items 
            JOIN public.orders ON orders.id = order_items.order_id
            WHERE order_items.id = order_item_id AND (orders.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
        )
    );
    CREATE POLICY "Admin all order_item_additions" ON public.order_item_additions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- User Roles
DO $$ BEGIN
    CREATE POLICY "Users can see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
    CREATE POLICY "Admin all user_roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Function Execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
