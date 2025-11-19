import { create } from 'zustand';
import type { Tables } from '@/integrations/supabase/types';

type PromptDraft = Tables<'prompt_drafts'>;

type TabType = 'about' | 'prompt' | 'variables' | 'model' | 'test' | 'version';

interface PromptEditorState {
  activeTab: TabType;
  draftData: PromptDraft | null;
  isDirty: boolean;
  isSaving: boolean;
  detectedVariables: string[];
  setActiveTab: (tab: TabType) => void;
  setDraft: (draft: PromptDraft | null) => void;
  updateDraftField: (field: keyof PromptDraft, value: any) => void;
  setDirty: (isDirty: boolean) => void;
  setSaving: (isSaving: boolean) => void;
  setDetectedVariables: (vars: string[]) => void;
  reset: () => void;
}

export const usePromptEditorStore = create<PromptEditorState>((set) => ({
  activeTab: 'about',
  draftData: null,
  isDirty: false,
  isSaving: false,
  detectedVariables: [],
  setActiveTab: (tab) => set({ activeTab: tab }),
  setDraft: (draft) => set({ draftData: draft, isDirty: false }),
  updateDraftField: (field, value) =>
    set((state) => ({
      draftData: state.draftData
        ? { ...state.draftData, [field]: value }
        : null,
      isDirty: true,
    })),
  setDirty: (isDirty) => set({ isDirty }),
  setSaving: (isSaving) => set({ isSaving }),
  setDetectedVariables: (vars) => set({ detectedVariables: vars }),
  reset: () =>
    set({
      activeTab: 'about',
      draftData: null,
      isDirty: false,
      isSaving: false,
      detectedVariables: [],
    }),
}));
