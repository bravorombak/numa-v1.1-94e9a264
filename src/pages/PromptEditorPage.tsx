import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePromptDraft } from '@/hooks/usePromptDrafts';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { PromptEditorHeader } from '@/components/prompt-editor/PromptEditorHeader';
import { PromptEditorTabs } from '@/components/prompt-editor/PromptEditorTabs';
import { AboutTab } from '@/components/prompt-editor/AboutTab';

const PromptEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: draft, isLoading, error } = usePromptDraft(id || '');
  const { setDraft, activeTab, reset } = usePromptEditorStore();

  useEffect(() => {
    if (draft) {
      setDraft(draft);
    }
    return () => {
      reset();
    };
  }, [draft, setDraft, reset]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading draft...</p>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Draft not found</h1>
          <p className="mt-2 text-muted-foreground">
            The prompt draft you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PromptEditorHeader />
      <PromptEditorTabs />
      <div className="flex-1 overflow-auto">
        {activeTab === 'about' && <AboutTab />}
        {activeTab === 'prompt' && (
          <div className="p-6 text-center text-muted-foreground">
            Prompt tab coming soon
          </div>
        )}
        {activeTab === 'variables' && (
          <div className="p-6 text-center text-muted-foreground">
            Variables tab coming soon
          </div>
        )}
        {activeTab === 'model' && (
          <div className="p-6 text-center text-muted-foreground">
            Model tab coming soon
          </div>
        )}
        {activeTab === 'test' && (
          <div className="p-6 text-center text-muted-foreground">
            Test tab coming soon
          </div>
        )}
        {activeTab === 'version' && (
          <div className="p-6 text-center text-muted-foreground">
            Version tab coming soon
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptEditorPage;
