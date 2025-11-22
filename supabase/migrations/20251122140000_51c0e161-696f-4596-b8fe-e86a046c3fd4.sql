-- Create numa-files storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('numa-files', 'numa-files', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Users can upload to their own folders
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'numa-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'numa-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'numa-files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);