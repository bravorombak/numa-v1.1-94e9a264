import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePromptEditorStore } from '@/stores/promptEditorStore';

export const PromptEditorTabs = () => {
  const { activeTab, setActiveTab } = usePromptEditorStore();

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger value="about" className="rounded-none">
          About
        </TabsTrigger>
        <TabsTrigger value="prompt" className="rounded-none">
          Prompt
        </TabsTrigger>
        <TabsTrigger value="variables" className="rounded-none">
          Variables
        </TabsTrigger>
        <TabsTrigger value="model" className="rounded-none">
          Model
        </TabsTrigger>
        <TabsTrigger value="test" className="rounded-none">
          Test
        </TabsTrigger>
        <TabsTrigger value="version" className="rounded-none">
          Version
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
