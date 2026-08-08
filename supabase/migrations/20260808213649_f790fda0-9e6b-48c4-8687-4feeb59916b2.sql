-- 1. Create the new category 'SOBREMESAS'
INSERT INTO public.categories (name, slug, "order", is_active)
VALUES ('SOBREMESAS', 'sobremesas', 4, true);

-- 2. Insert the dessert products
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM public.categories WHERE slug = 'sobremesas' LIMIT 1), 'Chocolate Trento branco', 'Delicioso chocolate Trento branco', 3.50, true, 1),
((SELECT id FROM public.categories WHERE slug = 'sobremesas' LIMIT 1), 'Chocolate Trento torta de limão', 'Delicioso chocolate Trento torta de limão', 3.50, true, 2),
((SELECT id FROM public.categories WHERE slug = 'sobremesas' LIMIT 1), 'Chocolate Trento 38% cacau', 'Delicioso chocolate Trento 38% cacau', 3.50, true, 3);
