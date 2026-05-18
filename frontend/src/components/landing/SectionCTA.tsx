import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionCTA() {
  return (
    <section className="py-24 bg-foreground relative overflow-hidden">
      {/* Pattern de fond micro-géométrique lié à la bordure sombre du système */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border-dark)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <span className="text-secondary font-mono text-xs font-bold uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md">
          Accès gratuit pour les étudiants
        </span>
        
        <h2 className="font-sans font-black text-4xl sm:text-5xl text-background tracking-tight mt-6 max-w-2xl mx-auto leading-none">
          Construis ton équipe. Lance ta startup.
        </h2>
        
        <p className="mt-6 text-muted-foreground/80 text-base sm:text-lg font-normal max-w-xl mx-auto leading-relaxed">
          Rejoins plus de 800 talents issus de Polytechnique, de l'INSCAE, de la MISA et de l'ISCAM prêts à s'associer.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10 max-w-md mx-auto">
          <Button
            variant="default"
            size="lg"
            asChild
          >
            <Link to="/signup" className="flex items-center justify-center gap-2">
              Créer mon profil fondateur <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-border-dark bg-foreground/40 text-muted-foreground hover:bg-foreground hover:text-background"
            asChild
          >
            <Link to="/projects">Voir les profils</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}