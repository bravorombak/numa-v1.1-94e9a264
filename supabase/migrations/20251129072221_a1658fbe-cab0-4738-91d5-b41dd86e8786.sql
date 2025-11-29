-- Drop overly permissive SELECT policy on models
DROP POLICY IF EXISTS "Models readable by all authenticated" ON public.models;

-- Create new SELECT policy: Only admin & editor can read models
CREATE POLICY "Models readable by admin and editor"
ON public.models
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'editor'::app_role)
);