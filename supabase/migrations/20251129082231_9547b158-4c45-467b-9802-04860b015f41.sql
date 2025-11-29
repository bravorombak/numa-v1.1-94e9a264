-- ============================================
-- PHASE 1: SIMPLIFY AND HARDEN API KEY STORAGE
-- ============================================

-- 1. Drop the models_public view completely
DROP VIEW IF EXISTS public.models_public CASCADE;

-- 2. Create ai_providers table (admin-only, for API credentials)
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  api_credential text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- Admin-only access to ai_providers table
CREATE POLICY "AI providers admin all"
ON public.ai_providers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Backfill existing provider credentials from models → ai_providers
-- This preserves existing API keys before dropping the column
INSERT INTO public.ai_providers (provider, api_credential)
SELECT DISTINCT m.provider, m.api_key
FROM public.models m
WHERE m.api_key IS NOT NULL
  AND m.api_key != ''
ON CONFLICT (provider) DO UPDATE
SET api_credential = EXCLUDED.api_credential,
    updated_at = now();

-- 4. Drop api_key column from models table
-- Keys are now stored in ai_providers only
ALTER TABLE public.models DROP COLUMN IF EXISTS api_key;

-- 5. Update RLS on models table
-- Clean up old policies
DROP POLICY IF EXISTS "Models readable by admins only" ON public.models;
DROP POLICY IF EXISTS "Models readable by admin and editor" ON public.models;

-- Allow admins and editors to read model metadata (no secrets)
CREATE POLICY "Models readable by admin and editor"
ON public.models
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'editor'::app_role)
);

-- Keep existing admin-only write policy
-- (already exists as "Models manageable by admins")