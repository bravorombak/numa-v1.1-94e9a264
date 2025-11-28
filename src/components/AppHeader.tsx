import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import numaLogo from "@/assets/numa-logo.png";

export function AppHeader() {
  const { user, profile, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = () => {
    const name = profile?.full_name || user?.email || "U";
    return name
      .split(/[\s.@]+/)
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <header className="flex h-14 items-center border-b px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/" className="flex items-center">
          <img 
            src={numaLogo} 
            alt="Numa" 
            className="h-8 w-auto cursor-pointer transition-transform duration-200 hover:scale-105 hover:opacity-90"
          />
        </Link>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        {user && (
          <>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-foreground">
              {getInitials()}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
