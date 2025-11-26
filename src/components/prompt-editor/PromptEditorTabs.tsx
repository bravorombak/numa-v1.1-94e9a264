import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePromptEditorStore } from '@/stores/promptEditorStore';

export const PromptEditorTabs = () => {
  const { activeTab, setActiveTab } = usePromptEditorStore();

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 overflow-x-auto flex-nowrap">
        <TabsTrigger value="about" className="rounded-none flex-shrink-0">
          About
        </TabsTrigger>
        <TabsTrigger value="prompt" className="rounded-none flex-shrink-0">
          Prompt
        </TabsTrigger>
        <TabsTrigger value="variables" className="rounded-none flex-shrink-0">
          Variables
        </TabsTrigger>
        <TabsTrigger value="model" className="rounded-none flex-shrink-0">
          Model
        </TabsTrigger>
        <TabsTrigger value="test" className="rounded-none flex-shrink-0">
          Test
        </TabsTrigger>
        <TabsTrigger value="version" className="rounded-none flex-shrink-0">
          Version
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
