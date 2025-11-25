-- Create public bucket for guide images (safe if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('guide_uploads', 'guide_uploads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload guide images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'guide_uploads');

-- RLS: Anyone can view (public bucket)
CREATE POLICY "Anyone can view guide images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'guide_uploads');