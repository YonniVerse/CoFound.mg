import { Link } from "react-router-dom";
import { Globe, Mail, MessageCircle } from "lucide-react";

const footerLinks = {
  produit: [
    { label: "Explorer les projets", href: "/projects" },
    { label: "Trouver un co-fondateur", href: "/profiles" },
    { label: "Publier mon projet", href: "/signup" },
    { label: "Impact & Parité", href: "/impact" },
  ],
  ressources: [
    { label: "À propos", href: "#" },
    { label: "Comment ça marche", href: "#how-it-works" },
    { label: "Écoles partenaires", href: "#" },
    { label: "FAQ", href: "#" },
  ],
  legal: [
    { label: "Politique de confidentialité", href: "#" },
    { label: "Conditions d'utilisation", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Logo */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-0 mb-3">
              <span className="font-heading text-xl font-bold text-white">CoFound</span>
              <span className="font-heading text-xl font-bold text-primary">.mg</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed mb-5">
              Ensemble, nous construisons l'Afrique de demain.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Website">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Mail">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="Contact">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Produit */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4">Produit</h4>
            <ul className="space-y-2.5">
              {footerLinks.produit.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Ressources */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4">Ressources</h4>
            <ul className="space-y-2.5">
              {footerLinks.ressources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Légal */}
          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4">Légal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500 text-center">
            © {new Date().getFullYear()} CoFound.mg. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
