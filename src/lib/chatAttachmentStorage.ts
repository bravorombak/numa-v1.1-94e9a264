import { supabase } from '@/integrations/supabase/client';
import type { ChatAttachment } from '@/types/chat';

const BUCKET_NAME = 'numa-files';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'application/pdf',
];

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  mimeType: string;
}

export async function uploadChatAttachment(
  file: File,
  sessionId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      'Invalid file type. Only images (PNG, JPG, WEBP, GIF) and PDFs are allowed'
    );
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${timestamp}-${sanitizedName}`;
  const path = `${user.id}/chat-attachments/${sessionId}/${filename}`;

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
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

export function mapUploadResultToAttachment(
  result: UploadResult
): ChatAttachment {
  return {
    type: result.mimeType.startsWith('image/') ? 'image' : 'file',
    url: result.url,
    name: result.name,
    size: result.size,
    mimeType: result.mimeType,
  };
}
