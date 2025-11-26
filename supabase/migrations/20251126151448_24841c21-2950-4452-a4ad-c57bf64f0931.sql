-- Add icon_type and icon_value columns to prompt_drafts
ALTER TABLE prompt_drafts
  ADD COLUMN icon_type text CHECK (icon_type IN ('emoji', 'image')) NULL,
  ADD COLUMN icon_value text NULL;

-- Add icon_type and icon_value columns to prompt_versions
ALTER TABLE prompt_versions
  ADD COLUMN icon_type text CHECK (icon_type IN ('emoji', 'image')) NULL,
  ADD COLUMN icon_value text NULL;

-- Backfill prompt_versions: prefer image over emoji if both exist
UPDATE prompt_versions
SET icon_type  = CASE
                   WHEN image_url IS NOT NULL AND image_url <> '' THEN 'image'
                   WHEN emoji IS NOT NULL AND emoji <> '' THEN 'emoji'
                   ELSE NULL
                 END,
    icon_value = CASE
                   WHEN image_url IS NOT NULL AND image_url <> '' THEN image_url
                   WHEN emoji IS NOT NULL AND emoji <> '' THEN emoji
                   ELSE NULL
                 END;

-- Backfill prompt_drafts: prefer image over emoji if both exist
UPDATE prompt_drafts
SET icon_type  = CASE
                   WHEN image_url IS NOT NULL AND image_url <> '' THEN 'image'
                   WHEN emoji IS NOT NULL AND emoji <> '' THEN 'emoji'
                   ELSE NULL
                 END,
    icon_value = CASE
                   WHEN image_url IS NOT NULL AND image_url <> '' THEN image_url
                   WHEN emoji IS NOT NULL AND emoji <> '' THEN emoji
                   ELSE NULL
                 END;