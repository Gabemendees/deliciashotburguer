-- 1. Remove old generic beverage entries
DELETE FROM public.products 
WHERE category_id = (SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1);

-- 2. Insert new detailed beverage products
-- 200ml
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca 200ml', 'Refrigerante 200ml', 3.00, true, 30),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca Zero 200ml', 'Refrigerante 200ml', 3.00, true, 31),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Fanta 200ml', 'Refrigerante 200ml', 3.00, true, 32),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Mate Couro 200ml', 'Refrigerante 200ml', 3.00, true, 33),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Mate Couro Zero 200ml', 'Refrigerante 200ml', 3.00, true, 34),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Soda 200ml', 'Refrigerante 200ml', 3.00, true, 35);

-- 350ml
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca 350ml', 'Lata 350ml', 6.00, true, 36),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca Zero 350ml', 'Lata 350ml', 6.00, true, 37),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Guaraná 350ml', 'Lata 350ml', 6.00, true, 38),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Guaraná Zero 350ml', 'Lata 350ml', 6.00, true, 39),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Fanta 350ml', 'Lata 350ml', 6.00, true, 40),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Sprite 350ml', 'Lata 350ml', 6.00, true, 41);

-- 600ml
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca 600ml', 'Garrafa 600ml', 9.00, true, 42),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca Zero 600ml', 'Garrafa 600ml', 9.00, true, 43),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Guaraná 600ml', 'Garrafa 600ml', 9.00, true, 44),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Guaraná Zero 600ml', 'Garrafa 600ml', 9.00, true, 45),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Sprite 600ml', 'Garrafa 600ml', 9.00, true, 46);

-- 1 Litro
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Mate Couro 1L', 'Garrafa 1L', 10.00, true, 47),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Mate Couro Zero 1L', 'Garrafa 1L', 10.00, true, 48),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca 1L', 'Garrafa 1L', 12.00, true, 49),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca Zero 1L', 'Garrafa 1L', 12.00, true, 50);

-- 2 Litros
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Kuat Guaraná 2L', 'Garrafa 2L', 12.00, true, 51),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Fanta 2L', 'Garrafa 2L', 14.00, true, 52),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), 'Coca 2L', 'Garrafa 2L', 16.00, true, 53);
