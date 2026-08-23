import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "../ui/LogoSVG";
import { LanguageSwitcher, useI18n } from "@/i18n";

const navLinks = [
  { label: "nav.exploreProfiles", href: "/feed" },
  { label: "nav.method", href: "#how-it-works" },
  { label: "nav.impact", href: "/impact" },
] as const;

export function Navbar() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 flex items-center",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-2xs h-16"
          : "bg-transparent border-b border-transparent h-20"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        
        {/* Identité de marque */}
        <Link to="/" className="flex items-center group transition-opacity hover:opacity-90">
          <LogoSVG className="h-10 md:h-12 w-auto -translate-y-1.5" />
        </Link>

        {/* Navigation Grand Écran */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors duration-200 relative group"
            >
              {t(link.label)}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100" />
            </a>
          ))}
        </div>

        {/* Boutons d'actions Grand Écran */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-shadow hover:bg-primary/80 hover:shadow-md"
            asChild
          >
            <Link to="/login">
              {t('nav.login')}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {/* Menu Mobile Triggers */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu Mobile déroulant */}
      {mobileOpen && (
        <div id="mobile-navigation" className="absolute top-full left-0 right-0 bg-background border-b border-border px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg" role="dialog" aria-label={t('nav.mobileNavigation')}>
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base font-semibold text-foreground/80 hover:text-primary py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t(link.label)}
            </a>
          ))}
          <div className="flex flex-col gap-3 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between gap-3">
              <LanguageSwitcher />
              <Button
                variant="default"
                className="gap-1.5 rounded-lg bg-primary font-semibold text-primary-foreground shadow-sm"
                asChild
              >
                <Link to="/login">
                  {t('nav.login')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
