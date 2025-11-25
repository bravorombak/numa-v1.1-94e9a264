import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePromptDraft } from '@/hooks/usePromptDrafts';
import { usePromptEditorStore } from '@/stores/promptEditorStore';
import { useAuthStore } from '@/stores/authStore';
import { AccessDenied } from '@/components/common/AccessDenied';
import { PromptEditorHeader } from '@/components/prompt-editor/PromptEditorHeader';
import { PromptEditorTabs } from '@/components/prompt-editor/PromptEditorTabs';
import { AboutTab } from '@/components/prompt-editor/AboutTab';
import { PromptTab } from '@/components/prompt-editor/PromptTab';
import { VariablesTab } from '@/components/prompt-editor/VariablesTab';
import { ModelTab } from '@/components/prompt-editor/ModelTab';
import { TestTab } from '@/components/prompt-editor/TestTab';
import { VersionTab } from '@/components/prompt-editor/VersionTab';
import { extractVariables } from '@/lib/variableDetection';

const PromptEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuthStore();
  const { data: draft, isLoading, error } = usePromptDraft(id || '');
  const { setDraft, setDetectedVariables, activeTab, reset } = usePromptEditorStore();

  // Role guard - only Admin and Editor can edit prompts
  const role = profile?.role || 'user';
  const canEdit = role === 'admin' || role === 'editor';

  if (!canEdit) {
    return <AccessDenied message="You don't have permission to edit prompts." />;
  }

  useEffect(() => {
    if (draft) {
      setDraft(draft);
      // Initialize detected variables from the loaded prompt
      const detected = extractVariables(draft.prompt_text || '');
      setDetectedVariables(detected);
    }
    return () => {
      reset();
    };
  }, [draft, setDraft, setDetectedVariables, reset]);

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
        {activeTab === 'prompt' && <PromptTab />}
        {activeTab === 'variables' && <VariablesTab />}
        {activeTab === 'model' && <ModelTab />}
        {activeTab === 'test' && <TestTab />}
        {activeTab === 'version' && <VersionTab />}
      </div>
    </div>
  );
};

export default PromptEditorPage;
