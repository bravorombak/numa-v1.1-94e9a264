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

  const handleSave = async () => {
    if (!draftData) return;

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
    <div className="flex items-center justify-between border-b bg-background px-6 py-4">
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
      <Button onClick={handleSave} disabled={!isDirty || isSaving}>
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
};
