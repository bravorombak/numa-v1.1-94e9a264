-- Create generation_logs table for rate limiting and analytics
CREATE TABLE generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_draft_id UUID REFERENCES prompt_drafts(id) ON DELETE SET NULL,
  model_id UUID REFERENCES models(id) ON DELETE SET NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create index for efficient rate limiting queries
CREATE INDEX idx_generation_logs_user_created ON generation_logs(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own generation logs
CREATE POLICY "Users can view own generation logs"
  ON generation_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own generation logs
CREATE POLICY "Users can insert own generation logs"
  ON generation_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);