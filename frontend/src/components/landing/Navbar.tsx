import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Explorer", href: "/projects" },
  { label: "À propos", href: "#how-it-works" },
  { label: "Impact", href: "/impact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-sm border-b border-slate-200"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0">
          <span className="font-heading text-xl font-bold text-slate-900">CoFound</span>
          <span className="font-heading text-xl font-bold text-primary">.mg</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Se connecter</Link>
          </Button>
          <Button size="sm" className="bg-primary hover:bg-primary-dark text-white rounded-lg" asChild>
            <Link to="/signup">
              Rejoindre <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 text-slate-700"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 pb-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary-dark text-white" asChild>
                <Link to="/signup">Rejoindre</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
