-- Update the password for the administrative user
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'deliciahotburguers@gmail.com') THEN
        UPDATE auth.users 
        SET encrypted_password = crypt('%0cEUvhW', gen_salt('bf')),
            updated_at = now()
        WHERE email = 'deliciahotburguers@gmail.com';
    END IF;
END
$$;
