-- Step 1: Add ON DELETE CASCADE to messages.session_id FK
-- Drop existing FK constraint and recreate with CASCADE
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_session_id_fkey;

-- Recreate the FK with ON DELETE CASCADE
ALTER TABLE public.messages
ADD CONSTRAINT messages_session_id_fkey
FOREIGN KEY (session_id)
REFERENCES public.sessions(id)
ON DELETE CASCADE;

-- Step 2: Add DELETE RLS policy for sessions
-- Note: DELETE policies only use USING clause, not WITH CHECK
CREATE POLICY "Sessions are deletable by owner"
ON public.sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT messages_session_id_fkey ON public.messages IS 
  'FK to sessions with CASCADE delete - when a session is deleted, all its messages are automatically removed';