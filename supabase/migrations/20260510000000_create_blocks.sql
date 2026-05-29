-- Create blocks table
-- NOTE: previously referenced a non-existent `public.users` table and the
-- uuid-ossp `uuid_generate_v4()` function. Fixed to use the built-in
-- gen_random_uuid() and to reference `auth.users(id)` directly. Referencing
-- auth.users (rather than public.profiles) makes this migration independent of
-- migration ordering — auth.users always exists — and avoids failing when a
-- user has no profile row yet.
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent)
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocks;
CREATE POLICY "Users can view their own blocks" ON public.blocks
    FOR SELECT USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can insert their own blocks" ON public.blocks;
CREATE POLICY "Users can insert their own blocks" ON public.blocks
    FOR INSERT WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocks;
CREATE POLICY "Users can delete their own blocks" ON public.blocks
    FOR DELETE USING (auth.uid() = blocker_id);
