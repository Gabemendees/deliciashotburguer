
ALTER TABLE public.additions ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

UPDATE public.additions SET "order" = 1 WHERE name = 'Azeitona';
UPDATE public.additions SET "order" = 2 WHERE name = 'Ovo de codorna';
UPDATE public.additions SET "order" = 3 WHERE name = 'Orégano';
UPDATE public.additions SET "order" = 4 WHERE name = 'Salsicha';
UPDATE public.additions SET "order" = 5 WHERE name = 'Passas';
UPDATE public.additions SET "order" = 6 WHERE name = 'Ovo de caipira';
UPDATE public.additions SET "order" = 7 WHERE name = 'Milho';
UPDATE public.additions SET "order" = 8 WHERE name = 'Batata palha';
UPDATE public.additions SET "order" = 9 WHERE name = 'Catupiry';
UPDATE public.additions SET "order" = 10 WHERE name = 'Mussarela';
UPDATE public.additions SET "order" = 11 WHERE name = 'Cheddar';
UPDATE public.additions SET "order" = 12 WHERE name = 'Queijo especial';
UPDATE public.additions SET "order" = 13 WHERE name = 'Frango desfiado';
UPDATE public.additions SET "order" = 14 WHERE name = 'Bacon';
UPDATE public.additions SET "order" = 15 WHERE name = 'Presunto';
UPDATE public.additions SET "order" = 16 WHERE name = 'Molho à Bolonhesa';
UPDATE public.additions SET "order" = 17 WHERE name = 'Hambúrguer de boi';
UPDATE public.additions SET "order" = 18 WHERE name = 'Hambúrguer de frango';
UPDATE public.additions SET "order" = 19 WHERE name = 'Hambúrguer de picanha';
