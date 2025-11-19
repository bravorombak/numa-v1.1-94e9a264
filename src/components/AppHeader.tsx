import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="flex h-14 items-center border-b px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Numa v1.1</h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {/* Placeholder for future user menu */}
      </div>
    </header>
  );
}
