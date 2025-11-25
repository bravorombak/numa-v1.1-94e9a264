import { supabase } from "@/integrations/supabase/client";

/**
 * Upload an image to the guide_uploads bucket
 * @param file Image file to upload
 * @returns Public URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadGuideImage(file: File): Promise<string> {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (2MB max)
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_SIZE) {
    throw new Error('Image must be under 2MB');
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${cleanName}`;

  // Upload to guide_uploads bucket
  const { data, error } = await supabase.storage
    .from('guide_uploads')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload image');
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('guide_uploads')
    .getPublicUrl(data.path);

  return publicUrl;
}
