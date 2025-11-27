import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthStore } from "@/stores/authStore";

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const { initialized, user } = useAuthStore();
  
  // Guard: wait until mobile detection AND auth is initialized
  if (isMobile === undefined || !initialized) {
    return null;
  }
  
  return (
    <SidebarProvider defaultOpen={!isMobile} key={user?.id ?? 'no-user'} className="fixed inset-0 flex w-full overflow-hidden">
      <div className="flex h-full w-full min-h-0">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-h-0">
          <AppHeader />
          <main className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
