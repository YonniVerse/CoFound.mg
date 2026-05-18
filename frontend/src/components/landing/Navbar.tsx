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
          ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 h-16 text-white"
          : "bg-transparent text-slate-900"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo Identity */}
        <Link to="/" className="flex items-center gap-1 group">
          <span className={cn("font-sans text-xl font-black tracking-tight transition-colors", scrolled ? "text-white" : "text-slate-950")}>
            CoFound
          </span>
          <span className="font-sans text-xl font-black text-indigo-500 group-hover:text-orange-500 transition-colors">.mg</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors duration-200",
                scrolled 
                  ? "text-slate-400 hover:text-white" 
                  : "text-slate-600 hover:text-slate-950"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("text-sm font-medium", scrolled ? "text-slate-300 hover:text-white hover:bg-slate-900" : "text-slate-700 hover:text-slate-950")} 
            asChild
          >
            <Link to="/login">Se connecter</Link>
          </Button>
          <Button 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 font-medium shadow-lg shadow-indigo-600/10 transition-all"
            asChild
          >
            <Link to="/signup" className="flex items-center gap-1.5">
              Rejoindre l'écosystème <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className={cn("md:hidden p-2 rounded-lg", scrolled ? "text-slate-200" : "text-slate-800")}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-slate-950 border-b border-slate-800 px-6 py-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base font-medium text-slate-300 py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-slate-900">
            <Button variant="outline" className="border-slate-800 text-white hover:bg-slate-900" asChild>
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button className="bg-indigo-600 text-white hover:bg-indigo-500" asChild>
              <Link to="/signup">Rejoindre</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}