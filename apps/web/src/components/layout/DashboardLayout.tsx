import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { onboardingStepResponseSchema } from "@cofound/shared";
import { apiClient } from "@/lib/api-client";
import { 
  Home, 
  Search, 
  Users,
  BarChart2,
  User,
  CheckCircle2,
  Settings,
  Menu
} from "lucide-react";
import { LogoSVG } from "../ui/LogoSVG";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

type CurrentProfile = {
  user?: { email?: string | null };
  identity?: { firstName?: string | null; lastName?: string | null } | null;
  profile?: { pseudonym?: string | null } | null;
};

const NAVIGATION = [
  { name: "Feed", href: "/feed", icon: Home },
  { name: "Recherche", href: "/search", icon: Search },
  { name: "Explorer Projets", href: "/projects", icon: Users },
  { name: "Impact & Parité", href: "/impact", icon: BarChart2 },
  { name: "Mon Profil", href: "/profile/me", icon: User },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();
  const { t } = useI18n();
  const [completionReminder, setCompletionReminder] = useState<{ shouldRemind: boolean; completion: number; ctaPath: '/onboarding' } | null>(null);
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile | null>(null);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return () => { active = false; };
    void apiClient.get('/me/onboarding', onboardingStepResponseSchema)
      .then((result) => {
        const completion = Math.max(result.progress.completion, Math.round((result.progress.completedSteps.length / 6) * 100))
        if (active) setCompletionReminder({ shouldRemind: !result.progress.isComplete, completion, ctaPath: '/onboarding' })
      })
      .catch(() => { if (active) setCompletionReminder(null); });
    return () => { active = false; };
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return () => { active = false; };
    void apiClient.get<CurrentProfile>('/me/profile')
      .then((profile) => { if (active) setCurrentProfile(profile); })
      .catch(() => { if (active) setCurrentProfile(null); });
    return () => { active = false; };
  }, [isAuthenticated]);

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
      </Link>
    )
  });

  const identityName = [currentProfile?.identity?.firstName, currentProfile?.identity?.lastName].filter(Boolean).join(' ').trim();
  const displayName = identityName || currentProfile?.profile?.pseudonym || currentProfile?.user?.email || 'Compte CoFound';
  const displaySecondary = currentProfile?.user?.email || currentProfile?.profile?.pseudonym || 'Profil personnel';
  const initial = displayName.charAt(0).toUpperCase() || 'C';
  const profileContent = (
    <div className="space-y-2">
      <Link to="/profile/me" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {initial}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold text-foreground">{displayName}</span>
          <span className="truncate text-xs text-muted-foreground font-medium">{displaySecondary}</span>
        </div>
      </Link>
      <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground" onClick={() => { void logout().then(() => navigate('/login', { replace: true })); }}>
        Se déconnecter
      </Button>
    </div>
  );

  if (isLoading) return <div role="status" className="flex min-h-[40vh] items-center justify-center text-muted-foreground">{t('common.loading')}</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col lg:flex-row">
      {/* Sidebar Gauche */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-background border-r border-border shadow-xs z-50">
        <div className="p-6">
          <Link to="/" className="flex items-center group transition-opacity hover:opacity-90">
            <LogoSVG className="h-12 w-auto -translate-y-1.5" />
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
      <header className="lg:hidden flex items-center justify-between p-2 bg-background border-b border-border z-40 sticky top-0">
        <Link to="/" className="flex items-center">
          <LogoSVG className="h-10 w-auto" />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 flex flex-col gap-0 w-64 bg-background border-r border-border">
            <div className="p-2">
              <Link to="/" className="flex items-center">
                <LogoSVG className="h-10 w-auto" />
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
      <main className="min-w-0 w-full flex-1 overflow-x-hidden lg:pl-64">
        {completionReminder?.shouldRemind && location.pathname !== '/onboarding' && (
          <div className="border-b border-primary/20 bg-primary/5 px-4 py-3 sm:px-8" role="status">
            <div className="mx-auto flex max-w-5xl items-center gap-3 sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-semibold text-foreground">{t('profile.completionReminder.message').replace('{completion}', String(completionReminder.completion))}</p>
                  <span className="shrink-0 text-sm font-bold text-primary">{completionReminder.completion}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10" role="progressbar" aria-label="Progression du profil" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completionReminder.completion}>
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completionReminder.completion}%` }} />
                </div>
              </div>
              <Link to={completionReminder.ctaPath} className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">{t('profile.completionReminder.action')}</Link>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
