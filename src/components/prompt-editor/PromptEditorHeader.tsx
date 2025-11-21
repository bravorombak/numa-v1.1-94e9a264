import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useSavePromptDraft } from '@/hooks/usePromptDrafts';
import { useToast } from '@/hooks/use-toast';

export const PromptEditorHeader = () => {
  const { draftData, isDirty, isSaving, setSaving, setDirty, setDraft } =
    usePromptEditorStore();
  const saveDraft = useSavePromptDraft();
  const { toast } = useToast();

  const isCategoryMissing = !draftData?.category_id;

  const handleSave = async () => {
    if (!draftData) return;

    // Prevent save if category is missing
    if (isCategoryMissing) {
      toast({
        title: 'Category required',
        description: 'Please select a category before saving this prompt.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const updatedDraft = await saveDraft.mutateAsync({
        id: draftData.id,
        title: draftData.title,
        description: draftData.description,
        emoji: draftData.emoji,
        image_url: draftData.image_url,
        category_id: draftData.category_id,
        prompt_text: draftData.prompt_text,
        variables: draftData.variables,
        model_id: draftData.model_id,
      });
      setDraft(updatedDraft);
      setDirty(false);
      toast({
        title: 'Draft saved',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error saving draft',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col border-b bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">
            {draftData?.title || 'Untitled prompt'}
          </h1>
          {isDirty && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Unsaved changes</span>
            </div>
          )}
        </div>
        <Button onClick={handleSave} disabled={!isDirty || isSaving || isCategoryMissing}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      {isCategoryMissing && (
        <div className="bg-destructive/10 border-t border-destructive/20 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Please select a category before saving this prompt</span>
          </div>
        </div>
      )}
    </div>
  );
};
