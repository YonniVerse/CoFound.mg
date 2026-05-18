import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Explorer les profils", href: "/projects" },
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-20 flex items-center",
        scrolled
          ? "bg-foreground/90 backdrop-blur-md border-b border-border-dark/40 h-16 text-background"
          : "bg-transparent text-foreground"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        
        {/* Identité de marque */}
        <Link to="/" className="flex items-center gap-1 group">
          <span className={cn("font-sans text-xl font-black tracking-tight transition-colors", scrolled ? "text-background" : "text-foreground")}>
            CoFound
          </span>
          <span className="font-sans text-xl font-black text-primary group-hover:text-secondary transition-colors">.mg</span>
        </Link>

        {/* Navigation Grand Écran */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-200",
                scrolled 
                  ? "text-muted-foreground/80 hover:text-background" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Boutons d'actions Grand Écran */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("text-sm font-medium", scrolled ? "text-muted-foreground/90 hover:text-background hover:bg-background/10" : "")} 
            asChild
          >
            <Link to="/login">Se connecter</Link>
          </Button>
          <Button 
            variant="default"
            size="sm" 
            asChild
          >
            <Link to="/signup" className="flex items-center gap-1.5">
              Rejoindre l'écosystème <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Menu Mobile Triggers */}
        <button
          className={cn("md:hidden p-2 rounded-lg transition-colors", scrolled ? "text-background" : "text-foreground")}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Menu Mobile déroulant */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-foreground border-b border-border-dark/60 px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base font-medium text-muted-foreground/90 hover:text-background py-2 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-border-dark/20">
            <Button variant="outline" className="border-border-dark bg-transparent text-background hover:bg-background/10 hover:text-background" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/signup">Rejoindre</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}