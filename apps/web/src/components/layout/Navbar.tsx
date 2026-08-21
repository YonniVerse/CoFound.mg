import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoSVG } from "../ui/LogoSVG";

const navLinks = [
  { label: "Explorer les profils", href: "/feed" },
  { label: "La Méthode", href: "#how-it-works" },
  { label: "Impact 50/50", href: "/impact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full opacity-0 group-hover:opacity-100" />
            </a>
          ))}
        </div>

        {/* Boutons d'actions Grand Écran */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm font-semibold hover:bg-muted" 
            asChild
          >
            <Link to="/connexion">Se connecter</Link>
          </Button>
          <Button 
            variant="default"
            size="sm" 
            className="font-semibold shadow-sm hover:shadow-md transition-shadow"
            asChild
          >
            <Link to="/feed" className="flex items-center gap-1.5">
              Rejoindre l'écosystème <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Menu Mobile Triggers */}
        <button
          className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu Mobile déroulant */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base font-semibold text-foreground/80 hover:text-primary py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
            <Button variant="outline" className="w-full justify-center font-semibold" asChild>
              <Link to="/connexion">Se connecter</Link>
            </Button>
            <Button variant="default" className="w-full justify-center font-semibold" asChild>
              <Link to="/feed">Rejoindre l'écosystème</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
