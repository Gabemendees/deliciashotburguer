UPDATE public.store_config 
SET value = value || '{"whatsapp": "31997013096"}'::jsonb 
WHERE key = 'store_info';