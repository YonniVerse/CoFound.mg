import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  Users, 
  MessageSquare, 
  BarChart2, 
  User, 
  Settings,
  Menu
} from "lucide-react";
import { LogoSVG } from "../ui/LogoSVG";
import { LogoIconSVG } from "../ui/LogoIconSVG";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

const NAVIGATION = [
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Explorer Projets", href: "/projects", icon: Search },
  { name: "Explorer Profils", href: "/profiles", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: 3 },
  { name: "Impact & Parité", href: "/impact", icon: BarChart2 },
  { name: "Mon Profil", href: "/profile/me", icon: User },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const navContent = NAVIGATION.map((item) => {
    const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    return (
      <Link
        key={item.name}
        to={item.href}
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <item.icon className={`h-5 w-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
          {item.name}
        </div>
        {item.badge && (
          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    )
  });

  const profileContent = (
    <Link to="/profile/me" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
        M
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-foreground">Mialy Randria</span>
        <span className="text-xs text-muted-foreground font-medium">ISCAM</span>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col lg:flex-row">
      {/* Sidebar Gauche */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-background border-r border-border shadow-xs z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center group transition-opacity hover:opacity-90">
            <LogoSVG className="hidden md:block h-8 w-auto" />
            <LogoIconSVG className="block md:hidden h-8 w-auto" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navContent}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          {profileContent}
        </div>
      </aside>

      {/* Header Mobile */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-background border-b border-border z-40 sticky top-0">
        <Link to="/" className="flex items-center">
          <LogoSVG className="h-8 w-auto" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col w-64 bg-background border-r border-border">
            <div className="p-6 pb-2">
              <Link to="/" className="flex items-center">
                <LogoSVG className="h-8 w-auto" />
              </Link>
            </div>
            <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto">
              {navContent}
            </nav>
            <div className="p-4 border-t border-border mt-auto">
              {profileContent}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 w-full">
        {children}
      </main>
    </div>
  );
}
