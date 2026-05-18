import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-900 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Info Marque */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-0.5">
            <span className="font-sans font-black text-lg tracking-tight text-white">CoFound</span>
            <span className="font-sans text-lg font-black text-indigo-500">.mg</span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed">
            Propulser la prochaine génération de licornes malgaches en connectant les compétences complémentaires au niveau universitaire.
          </p>
        </div>

        {/* Colonne Liens Écosystème */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Plateforme</h4>
          <ul className="flex flex-col gap-2.5 text-xs font-medium">
            <li><Link to="/projects" className="hover:text-white transition-colors">Explorer les talents</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Devenir Fondateur</Link></li>
            <li><Link to="/incubators" className="hover:text-white transition-colors">Espace Incubateurs</Link></li>
          </ul>
        </div>

        {/* Colonne Impact */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Engagement</h4>
          <ul className="flex flex-col gap-2.5 text-xs font-medium">
            <li><Link to="/impact" className="hover:text-white transition-colors">Charte Mixité 50/50</Link></li>
            <li><Link to="/schools" className="hover:text-white transition-colors">Universités Partenaires</Link></li>
          </ul>
        </div>

        {/* Colonne Légal */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">Légal</h4>
          <ul className="flex flex-col gap-2.5 text-xs font-medium">
            <li><a href="#terms" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
            <li><a href="#privacy" className="hover:text-white transition-colors">Confidentialité des données</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-medium">
        <p>© {currentYear} CoFound.mg. Fait pour l'écosystème entrepreneurial de Madagascar.</p>
        <p className="mt-2 sm:mt-0">Inspiré par les standards YC.</p>
      </div>
    </footer>
  );
}