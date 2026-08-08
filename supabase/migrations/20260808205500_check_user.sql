-- Check if the user exists and has the correct role if roles table exists
SELECT id, email, encrypted_password FROM auth.users WHERE email = 'deliciahotburguers@gmail.com';

-- Just in case, reset the password again to be 100% sure
UPDATE auth.users 
SET encrypted_password = crypt('%0cEUvhW', gen_salt('bf')),
    updated_at = now(),
    email_confirmed_at = now(),
    last_sign_in_at = NULL
WHERE email = 'deliciahotburguers@gmail.com';
