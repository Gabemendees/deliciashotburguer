-- Create or update the admin user with the correct role
-- Using DO block for safety

DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Check if user exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'deliciahotburguers@gmail.com') THEN
        -- Insert into auth.users (minimum required fields)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'deliciahotburguers@gmail.com',
            crypt('%0cEUvhW', gen_salt('bf')),
            now(),
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO new_user_id;
    ELSE
        -- Update existing user
        UPDATE auth.users 
        SET encrypted_password = crypt('%0cEUvhW', gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now()
        WHERE email = 'deliciahotburguers@gmail.com'
        RETURNING id INTO new_user_id;
    END IF;

    -- Ensure the user has the 'admin' role in user_roles table
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = new_user_id AND role = 'admin') THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END
$$;
