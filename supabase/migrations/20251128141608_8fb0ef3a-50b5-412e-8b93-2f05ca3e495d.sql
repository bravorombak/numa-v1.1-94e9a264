-- Add attachments column to messages table
ALTER TABLE messages
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb NOT NULL;

COMMENT ON COLUMN messages.attachments IS 'Array of attachment objects with type, url, name, size, mimeType';