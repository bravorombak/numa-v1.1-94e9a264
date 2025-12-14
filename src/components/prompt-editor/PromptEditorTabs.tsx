import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePromptEditorStore } from '@/stores/promptEditorStore';

type TabType = 'about' | 'prompt' | 'variables' | 'model' | 'test' | 'version';

interface PromptEditorTabsProps {
  onTabChange?: (tab: TabType) => void;
}

export const PromptEditorTabs = ({ onTabChange }: PromptEditorTabsProps) => {
  const { activeTab, setActiveTab } = usePromptEditorStore();

  const handleChange = (value: string) => {
    const tab = value as TabType;
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleChange}>
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 overflow-x-auto flex-nowrap">
        <TabsTrigger 
          value="about" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          About
        </TabsTrigger>
        <TabsTrigger 
          value="prompt" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          Prompt
        </TabsTrigger>
        <TabsTrigger 
          value="variables" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          Variables
        </TabsTrigger>
        <TabsTrigger 
          value="model" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          Model
        </TabsTrigger>
        <TabsTrigger 
          value="test" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          Test
        </TabsTrigger>
        <TabsTrigger 
          value="version" 
          className="rounded-none flex-shrink-0 relative border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent transition-all duration-200"
        >
          Version
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
