import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { LogOut } from "lucide-react";

export function AppHeader() {
  const { user, profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="flex h-14 items-center border-b px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold">Numa v1.1</h1>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-muted-foreground">
              {profile?.full_name || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
