-- Add 'grok' to the model_provider enum
-- This is backward-safe: existing values remain valid
ALTER TYPE model_provider ADD VALUE 'grok';