-- Allow users to update their own sessions
CREATE POLICY "Sessions are updatable by owner"
ON public.sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);