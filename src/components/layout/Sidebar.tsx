import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAppStore } from "@/store/useAppStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/reports", label: "My Reports", icon: FileText },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar = ({ onNav }: { onNav?: () => void }) => {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar/60 backdrop-blur-xl">
      <div className="px-6 py-5 border-b border-border">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          AI Credits
        </div>
        <div className="text-sm font-semibold mb-2">847 / 1000</div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[84%] bg-gradient-to-r from-accent to-teal-300 rounded-full" />
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-9 w-9 ring-2 ring-accent/30">
            <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">
              {user?.name?.[0] ?? "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name ?? "Auditor"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.role ?? "Viewer"}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-lg">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
