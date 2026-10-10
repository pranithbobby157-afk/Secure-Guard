-- SafeRoute Crisis Communication System
-- Migration 20261010000005: Add roles constraint ('admin', 'editor', 'user'), seed accounts, and define RLS rules

-- 1. Add CHECK constraint on public.users.role
DO $$
BEGIN
    ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
    ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'user'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Seed default Editor and User accounts
-- editor / editor123
INSERT INTO public.users (id, username, password_hash, role, created_at)
VALUES (
    'user-editor',
    'editor',
    'sha256$ef5e5a1fb95055e0e56cccf98a41e784a132c14e7f6e1ba244302f0e72b29baf',
    'editor',
    now()
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- user / user123
INSERT INTO public.users (id, username, password_hash, role, created_at)
VALUES (
    'user-general',
    'user',
    'sha256$e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446',
    'user',
    now()
)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- 3. Row Level Security Policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read own profile or admins to read all" ON public.users;
DROP POLICY IF EXISTS "Allow self update or admin update on users" ON public.users;
DROP POLICY IF EXISTS "Allow admins to insert users" ON public.users;

CREATE POLICY "Allow users to read own profile or admins to read all"
    ON public.users FOR SELECT
    TO anon, authenticated
    USING (
        auth.role() = 'service_role'
        OR auth.uid()::text = id
        OR (auth.jwt() ->> 'email') = username
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role = 'admin'
        )
    );

CREATE POLICY "Allow self update or admin update on users"
    ON public.users FOR UPDATE
    TO authenticated
    USING (
        auth.uid()::text = id
        OR (auth.jwt() ->> 'email') = username
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role = 'admin'
        )
    )
    WITH CHECK (
        auth.uid()::text = id
        OR (auth.jwt() ->> 'email') = username
        OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role = 'admin'
        )
    );

CREATE POLICY "Allow admins to insert users"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role = 'admin'
        )
        OR auth.uid()::text = id
    );

-- 4. RLS write policies on alerts (Admin & Editor)
DROP POLICY IF EXISTS "Allow admins and editors to insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow admins and editors to update alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow admins and editors to delete alerts" ON public.alerts;

CREATE POLICY "Allow admins and editors to insert alerts"
    ON public.alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Allow admins and editors to update alerts"
    ON public.alerts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Allow admins and editors to delete alerts"
    ON public.alerts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

-- 5. RLS write policies on safe_zones (Admin & Editor)
DROP POLICY IF EXISTS "Allow admins and editors to insert safe_zones" ON public.safe_zones;
DROP POLICY IF EXISTS "Allow admins and editors to update safe_zones" ON public.safe_zones;
DROP POLICY IF EXISTS "Allow admins and editors to delete safe_zones" ON public.safe_zones;

CREATE POLICY "Allow admins and editors to insert safe_zones"
    ON public.safe_zones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Allow admins and editors to update safe_zones"
    ON public.safe_zones FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Allow admins and editors to delete safe_zones"
    ON public.safe_zones FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role IN ('admin', 'editor')
        )
    );

-- 6. RLS write policies on sources (Admin only)
DROP POLICY IF EXISTS "Allow admins to modify sources" ON public.sources;
CREATE POLICY "Allow admins to modify sources"
    ON public.sources FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            WHERE (u.id = auth.uid()::text OR u.username = (auth.jwt() ->> 'email'))
              AND u.role = 'admin'
        )
    );
