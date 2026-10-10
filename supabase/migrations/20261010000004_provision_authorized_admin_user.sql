-- SafeRoute Crisis Communication System
-- Migration 20261010000004: Provision Authorized Google OAuth Administrator
--
-- Maps the authorized administrator account 'rohithkarthik25@gmail.com'
-- and Supabase Auth User ID '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962' to role 'admin' in public.users.
-- Ensures that when Rohith signs in via Google OAuth, Supabase Auth tokens map to authorized administrator privileges.
--
-- Idempotent: Safely executed on fresh or existing databases without key collisions.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.users WHERE id = '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962') THEN
        UPDATE public.users
        SET username = 'rohithkarthik25@gmail.com',
            role = 'admin'
        WHERE id = '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962';
    ELSIF EXISTS (SELECT 1 FROM public.users WHERE username = 'rohithkarthik25@gmail.com') THEN
        UPDATE public.users
        SET id = '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962',
            role = 'admin'
        WHERE username = 'rohithkarthik25@gmail.com';
    ELSIF EXISTS (SELECT 1 FROM public.users WHERE id = 'user-rohith') THEN
        UPDATE public.users
        SET id = '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962',
            username = 'rohithkarthik25@gmail.com',
            role = 'admin'
        WHERE id = 'user-rohith';
    ELSE
        INSERT INTO public.users (id, username, password_hash, role, created_at)
        VALUES (
            '7e1c1ef7-92b3-4d3f-8359-a59ff85ff962',
            'rohithkarthik25@gmail.com',
            'oauth_managed',
            'admin',
            now()
        );
    END IF;
END $$;
