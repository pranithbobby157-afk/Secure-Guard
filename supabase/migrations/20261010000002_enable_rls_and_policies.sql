-- ====================================================================
-- SafeRoute: Migration 02 - Row Level Security (RLS) & Access Policies
-- ====================================================================

-- Enable RLS on all public tables
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- Public Read Access Policies (Tourists require immediate unauthenticated access)
-- --------------------------------------------------------------------

CREATE POLICY "Allow public read on sources"
    ON public.sources FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public read on areas"
    ON public.areas FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public read on alerts"
    ON public.alerts FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public read on safe_zones"
    ON public.safe_zones FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public read on emergency_contacts"
    ON public.emergency_contacts FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public read on translations"
    ON public.translations FOR SELECT
    TO anon, authenticated
    USING (true);

-- --------------------------------------------------------------------
-- Privileged Operations (Restricted to Supabase Edge Functions service_role)
-- --------------------------------------------------------------------
-- The service_role bypasses RLS automatically in PostgreSQL.
-- The policies below explicitly ensure that anon/authenticated roles
-- CANNOT insert, update, or delete records without passing through
-- the verified Edge Functions.

-- Note: users and audit_logs tables intentionally have ZERO policies for anon/authenticated,
-- ensuring they are completely invisible to unauthorized public requests.
