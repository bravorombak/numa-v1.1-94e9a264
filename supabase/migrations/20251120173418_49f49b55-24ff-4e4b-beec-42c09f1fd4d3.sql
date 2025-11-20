-- Add title column to sessions table
ALTER TABLE public.sessions
ADD COLUMN title text NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.sessions.title IS 'Custom user-defined title for the session. If NULL, UI falls back to date-based title.';