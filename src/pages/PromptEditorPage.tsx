import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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

type TabType = 'about' | 'prompt' | 'variables' | 'model' | 'test' | 'version';
const ALLOWED_TABS: TabType[] = ['about', 'prompt', 'variables', 'model', 'test', 'version'];

const PromptEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, isEditor } = useAuthStore();
  const { data: draft, isLoading, error } = usePromptDraft(id || '');
  const { setDraft, setDetectedVariables, activeTab, setActiveTab, reset } = usePromptEditorStore();

  // Role guard - only Admin and Editor can edit prompts
  const canEdit = isAdmin || isEditor;

  if (!canEdit) {
    return <AccessDenied message="You don't have permission to edit prompts." />;
  }

  // Effect A: Sync URL tab param to store state
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ALLOWED_TABS.includes(tabFromUrl as TabType)) {
      setActiveTab(tabFromUrl as TabType);
    }
  }, [searchParams, setActiveTab]);

  // Effect B: Initialize draft data when loaded
  useEffect(() => {
    if (draft) {
      setDraft(draft);
      const detected = extractVariables(draft.prompt_text || '');
      setDetectedVariables(detected);
    }
  }, [draft, setDraft, setDetectedVariables]);

  // Effect C: Cleanup only on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Handle tab change with URL sync
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

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
      <PromptEditorTabs onTabChange={handleTabChange} />
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
