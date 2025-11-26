import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'numa-files';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

interface UploadResult {
  url: string;
  path: string;
}

export async function uploadPromptIcon(file: File): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 2MB limit');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed');
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;
  const path = `prompt-icons/${user.id}/${filename}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Generate signed URL (valid for 1 year)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(data.path, 60 * 60 * 24 * 365);

  if (signedUrlError) {
    throw new Error(`Failed to generate signed URL: ${signedUrlError.message}`);
  }

  return {
    url: signedUrlData.signedUrl,
    path: data.path,
  };
}

export async function deletePromptIcon(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}
