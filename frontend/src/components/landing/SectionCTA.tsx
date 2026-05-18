import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionCTA() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Pattern de fond micro-géométrique strict */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <span className="text-orange-500 font-mono text-xs font-bold uppercase tracking-widest bg-orange-500/10 px-3 py-1 rounded-md">
          Accès gratuit pour les étudiants
        </span>
        
        <h2 className="font-sans font-black text-4xl sm:text-5xl text-white tracking-tight mt-6 max-w-2xl mx-auto leading-none">
          Construis ton équipe. Lance ta startup.
        </h2>
        
        <p className="mt-6 text-slate-400 text-base sm:text-lg font-normal max-w-xl mx-auto leading-relaxed">
          Rejoins plus de 800 talents issus de Polytechnique, de l'INSCAE, de la MISA et de l'ISCAM prêts à s'associer.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 max-w-md mx-auto">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 px-6 font-semibold text-sm transition-all"
            asChild
          >
            <Link to="/signup" className="flex items-center justify-center gap-2">
              Créer mon profil fondateur <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl h-12 px-6 font-medium text-sm transition-all"
            asChild
          >
            <Link to="/projects">Voir les profils</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}