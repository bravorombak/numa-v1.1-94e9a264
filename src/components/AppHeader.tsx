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
      <div className="flex items-center gap-2 sm:gap-4">
        {user && (
          <>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {profile?.full_name || user.email}
            </span>
            {/* Icon-only button for mobile */}
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
            {/* Button with text for desktop */}
            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
