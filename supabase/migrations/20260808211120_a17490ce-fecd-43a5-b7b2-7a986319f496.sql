
-- 1. Inserir Categorias (se não existirem, embora pareça que já existam conforme o read_query anterior)
-- Vou usar ON CONFLICT se houver restrição de nome, mas farei simples.

-- 2. Inserir Produtos (HOT DOGS)
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES 
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG ORIGINAL', 'Pão, salsicha e mostarda.', 6.00, true, 1),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG SIMPLES', 'Pão, salsicha, milho e batata.', 10.00, true, 2),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'DELÍCIA''S HOT DOG TRADICIONAL', 'Pão, salsicha, mussarela, milho, ovo de codorna, batata palha, passas e orégano.', 12.00, true, 3),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG BACON', 'Pão, salsicha, mussarela, milho, batata palha, bacon e orégano.', 13.00, true, 4),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG 4 QUEIJOS', 'Pão, salsicha, mussarela, cheddar, catupiry, queijo especial e orégano.', 14.00, true, 5),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG À BOLONHESA', 'Pão, salsicha, mussarela, milho, batata palha, queijo especial, molho à bolonhesa e orégano.', 15.00, true, 6),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOG ESPECIAL', 'Pão, salsicha, mussarela, milho, peito de frango desfiado, catupiry, batata palha e orégano.', 16.00, true, 7),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'DELÍCIA''S HOT DOG', 'Pão, 2 salsichas, mussarela, milho, 2 ovos de codorna, batata palha, passas e orégano.', 18.00, true, 8),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'DOGÃO CAIPIRA', 'Pão, 2 salsichas, mussarela, milho, ovo caipira, cheddar, batata palha, passas e orégano.', 19.00, true, 9),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOGÃO BACON', 'Pão, 2 salsichas, mussarela, milho, batata, bacon e orégano.', 21.00, true, 10),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOGÃO ESPECIAL', 'Pão, 2 salsichas, mussarela, milho, peito de frango desfiado, catupiry, batata palha e orégano.', 23.00, true, 11),
((SELECT id FROM categories WHERE name = 'HOT DOGS' LIMIT 1), 'HOT DOGÃO BRUTO', 'Pão, 3 salsichas, mussarela, cheddar, catupiry, milho, bacon, ovo caipira, passas, ovo de codorna, peito de frango desfiado, batata palha, molho à bolonhesa e orégano.', 30.00, true, 12);

-- 3. Inserir Produtos (HAMBÚRGUERES)
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'HAMBURGUER SIMPLES', 'Pão, hambúrguer de boi, batata palha e salada.', 10.00, true, 14),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-EGG', 'Pão, hambúrguer de boi, ovo, milho, batata palha e salada.', 12.00, true, 15),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-BURGUER', 'Pão, hambúrguer de boi, mussarela, presunto, milho, batata palha e salada.', 13.00, true, 16),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-EGG BURGUER', 'Pão, hambúrguer de boi, ovo, mussarela, presunto, milho, batata palha e salada.', 14.00, true, 17),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-BACON', 'Pão, hambúrguer de boi, bacon, mussarela, milho, batata palha e salada.', 15.00, true, 18),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-EGG BACON', 'Pão, hambúrguer de boi, ovo, bacon, mussarela, presunto, milho, batata palha e salada.', 17.00, true, 19),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-TUDO', 'Pão, hambúrguer de boi, ovo, bacon, mussarela, presunto, frango desfiado, catupiry, milho, batata palha e salada.', 22.00, true, 20),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-BURGÃO', 'Pão, 2 hambúrgueres de boi, ovo, bacon, mussarela, presunto, frango desfiado, milho, batata palha e salada.', 23.00, true, 21),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'DELÍCIA''S HOT BURGUER''S', 'Pão, 2 hambúrgueres de boi, 2 hambúrgueres de frango, 2 ovos, bacon, 2 fatias de mussarela, 2 fatias de presunto, milho, batata palha e salada.', 33.00, true, 22),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-FRAN DUPLO', 'Pão, 2 hambúrgueres de frango, 2 ovos, 2 fatias de mussarela, 2 fatias de presunto, bacon, milho, batata palha e salada.', 30.00, true, 23),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-PICANHA', 'Pão, hambúrguer de picanha, ovo, bacon, mussarela, presunto, milho, batata palha e salada.', 23.00, true, 24),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-TRI LEGAL', 'Pão, hambúrguer de boi, hambúrguer de frango, hambúrguer de picanha, 3 ovos, bacon, mussarela, cheddar, catupiry, milho, batata palha e salada.', 35.00, true, 25),
((SELECT id FROM categories WHERE name = 'HAMBÚRGUERES' LIMIT 1), 'X-BASICÃO', 'Pão, 2 hambúrgueres de boi, bacon, ovo, presunto e mussarela.', 13.00, true, 26);

-- 4. Inserir Adicionais (Acréscimos)
INSERT INTO public.additions (name, price, is_available)
VALUES
('Azeitona', 1.00, true),
('Ovo de codorna', 1.00, true),
('Orégano', 1.00, true),
('Salsicha', 2.00, true),
('Passas', 2.00, true),
('Ovo de caipira', 2.00, true),
('Milho', 2.50, true),
('Batata palha', 2.50, true),
('Catupiry', 4.00, true),
('Mussarela', 4.00, true),
('Cheddar', 5.00, true),
('Queijo especial', 5.00, true),
('Frango desfiado', 4.00, true),
('Bacon', 4.00, true),
('Presunto', 4.00, true),
('Molho à Bolonhesa', 4.00, true),
('Hambúrguer de boi', 3.00, true),
('Hambúrguer de frango', 3.50, true),
('Hambúrguer de picanha', 4.00, true);

-- 5. Inserir Bebidas (baseado na imagem, embora a imagem cite 200ml, 220ml etc)
INSERT INTO public.products (category_id, name, description, price, is_available, "order")
VALUES
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '200ml', 'Refrigerantes e Sucos', 4.00, true, 30),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '220ml', 'Refrigerantes e Sucos', 5.00, true, 31),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '350ml', 'Lata', 6.00, true, 32),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '600ml', 'Garrafa', 8.00, true, 33),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '1L', 'Garrafa', 10.00, true, 34),
((SELECT id FROM categories WHERE name = 'BEBIDAS' LIMIT 1), '2L', 'Garrafa', 14.00, true, 35);
