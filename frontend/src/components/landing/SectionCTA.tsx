import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionCTA() {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h2 className="font-heading font-extrabold text-4xl sm:text-5xl text-white">
          Prêt à trouver ton équipe ?
        </h2>
        <p className="mt-5 text-slate-400 text-lg sm:text-xl font-medium max-w-2xl mx-auto">
          Rejoins 847 étudiants qui construisent l'avenir de Madagascar.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Button
            size="lg"
            className="bg-primary hover:bg-emerald-500 text-white shadow-xl shadow-primary/20 rounded-xl h-14 px-8 font-heading font-semibold text-lg transition-all hover:scale-105"
            asChild
          >
            <Link to="/signup">
              Créer mon profil gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-slate-700 bg-slate-900/50 text-white hover:bg-slate-800 hover:text-white rounded-xl h-14 px-8 font-heading font-medium text-lg transition-all hover:scale-105"
            asChild
          >
            <Link to="/projects">Voir les projets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
