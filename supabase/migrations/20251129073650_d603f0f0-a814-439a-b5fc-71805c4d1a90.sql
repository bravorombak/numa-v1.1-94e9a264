-- Drop existing SELECT policies on models table
DROP POLICY IF EXISTS "Models readable by admins" ON public.models;
DROP POLICY IF EXISTS "Models readable by admin and editor" ON public.models;

-- Create admin-only SELECT policy on base models table
-- This ensures only admins can see the api_key column
CREATE POLICY "Models readable by admins only"
ON public.models
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create sanitized view without api_key column
-- This view will be accessible to both admins and editors
CREATE OR REPLACE VIEW public.models_public 
WITH (security_invoker = false)
AS
SELECT
  id,
  name,
  provider,
  provider_model,
  status,
  max_tokens,
  description,
  created_at,
  updated_at
FROM public.models
WHERE has_role(auth.uid(), 'admin'::app_role) 
   OR has_role(auth.uid(), 'editor'::app_role);

-- Grant SELECT access on the view to authenticated users
GRANT SELECT ON public.models_public TO authenticated;