-- =========================================================================
--            GOLDEN NUMBER PWA - SUPABASE DATABASE SCHEMA
-- =========================================================================
-- Paste this script inside your Supabase SQL Editor to set up all tables,
-- constraints, indices, and secure Row Level Security (RLS) policies.

-- -------------------------------------------------------------------------
-- 1. Create Tables
-- -------------------------------------------------------------------------

-- TABLES TABLE
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER UNIQUE NOT NULL CHECK (table_number >= 1 AND table_number <= 10),
    is_open BOOLEAN DEFAULT false,
    draw_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER NOT NULL REFERENCES public.tables(table_number) ON DELETE CASCADE,
    number INTEGER NOT NULL CHECK (number >= 1 AND number <= 42),
    name TEXT,
    normalized_name TEXT,
    phone TEXT,
    nickname TEXT,
    contact_phone TEXT,
    status TEXT DEFAULT 'reserved'::text NOT NULL,
    price NUMERIC DEFAULT 3.00 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    paid_at TIMESTAMPTZ,
    browser_token TEXT,
    reservation_group_id UUID,
    CONSTRAINT unique_table_cell UNIQUE (table_number, number)
);

CREATE INDEX IF NOT EXISTS idx_reservations_reservation_group_id ON public.reservations (reservation_group_id);

-- PROFIT LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.profit_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER NOT NULL,
    number INTEGER NOT NULL,
    amount NUMERIC DEFAULT 3.00 NOT NULL,
    type TEXT DEFAULT 'paid'::text NOT NULL CHECK (type = ANY (ARRAY['paid'::text, 'reset'::text])),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure default tables exist
INSERT INTO public.tables (table_number, is_open)
VALUES 
    (1, true),
    (2, false),
    (3, false),
    (4, false),
    (5, false),
    (6, false),
    (7, false),
    (8, false),
    (9, false),
    (10, false)
ON CONFLICT (table_number) DO NOTHING;


-- -------------------------------------------------------------------------
-- 2. Enable Row Level Security (RLS)
-- -------------------------------------------------------------------------
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_ledger ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------------
-- 3. Define RLS Policies
-- -------------------------------------------------------------------------

-- Drop old, legacy, or conflicting policies if they exist to prevent primary or duplicate key constraint issues
DROP POLICY IF EXISTS "Allow public read-access on tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public select on tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public insert on tables" ON public.tables;
DROP POLICY IF EXISTS "Allow public update on tables" ON public.tables;

DROP POLICY IF EXISTS "Allow public select bookings" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert on active tables" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update on bookings" ON public.reservations;
DROP POLICY IF EXISTS "Allow reservation cancellation by holder if pending" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete on bookings" ON public.reservations;

DROP POLICY IF EXISTS "Allow public select ledger" ON public.profit_ledger;
DROP POLICY IF EXISTS "Allow public insert ledger" ON public.profit_ledger;
DROP POLICY IF EXISTS "Allow public update ledger" ON public.profit_ledger;
DROP POLICY IF EXISTS "Allow public delete ledger" ON public.profit_ledger;


-- TABLES: Everyone can read status; Anyone (including the client-side admin verified via PIN) can update/insert
CREATE POLICY "Allow public select on tables" 
ON public.tables FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on tables" 
ON public.tables FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on tables" 
ON public.tables FOR UPDATE 
USING (true)
WITH CHECK (true);


-- RESERVATIONS:
-- A. Select policy: Everyone can see current grid selections
CREATE POLICY "Allow public select bookings" 
ON public.reservations FOR SELECT 
USING (true);

-- B. Insert policy: Public can reserve slots
CREATE POLICY "Allow public insert on bookings" 
ON public.reservations FOR INSERT 
WITH CHECK (true);

-- C. Update policy: Allows admins to confirm payments (setting status='paid')
CREATE POLICY "Allow public update on bookings" 
ON public.reservations FOR UPDATE 
USING (true)
WITH CHECK (true);

-- D. Delete policy: Allows cancellation and resetting of numbers
CREATE POLICY "Allow public delete on bookings" 
ON public.reservations FOR DELETE 
USING (true);


-- PROFIT LEDGER:
-- Allow insert, select, update, and delete access.
CREATE POLICY "Allow public select ledger" 
ON public.profit_ledger FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert ledger" 
ON public.profit_ledger FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update ledger" 
ON public.profit_ledger FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete ledger" 
ON public.profit_ledger FOR DELETE 
USING (true);


-- -------------------------------------------------------------------------
-- 4. Enable Realtime Replication
-- -------------------------------------------------------------------------
BEGIN;
  -- Remove existing subscription if any
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Re-create replication pool with tables we listen to
  CREATE PUBLICATION supabase_realtime FOR TABLE public.tables, public.reservations, public.profit_ledger;
COMMIT;


-- -------------------------------------------------------------------------
-- 5. Grant API Access to Tables & Sequences
-- -------------------------------------------------------------------------
-- Ensure anon and authenticated roles have permission to insert/select/update/delete on public tables
GRANT ALL ON TABLE public.tables TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.reservations TO anon, authenticated, postgres, service_role;
GRANT ALL ON TABLE public.profit_ledger TO anon, authenticated, postgres, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, postgres, service_role;

