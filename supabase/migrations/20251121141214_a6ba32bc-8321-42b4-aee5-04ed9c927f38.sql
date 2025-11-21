-- Backfill category_id from prompt_drafts to prompt_versions
-- This fixes existing published versions that were created before category_id was included in the publish flow

UPDATE public.prompt_versions v
SET category_id = d.category_id
FROM public.prompt_drafts d
WHERE v.prompt_draft_id = d.id
  AND v.category_id IS NULL
  AND d.category_id IS NOT NULL;