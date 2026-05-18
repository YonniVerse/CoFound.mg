import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import ctaImage from "@/assets/images/cta.jpg";

export function SectionCTA() {
  return (
    <section className="py-24 bg-foreground relative overflow-hidden border-t border-border-dark/60">
      {/* Pattern de fond micro-géométrique lié à la bordure sombre du système */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--border-dark)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          
          {/* Contenu textuel */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <span className="text-secondary font-mono text-xs font-bold uppercase tracking-widest bg-secondary/10 px-3 py-1 rounded-md mb-6">
              Accès gratuit pour les étudiants
            </span>
            
            <h2 className="font-sans font-black text-4xl sm:text-5xl text-background tracking-tight max-w-xl leading-none">
              Construis ton équipe.<br />Lance ta startup.
            </h2>
            
            <p className="mt-6 mb-10 max-w-lg text-muted-foreground/80 text-lg font-normal leading-relaxed">
              Rejoins plus de 800 talents issus de Polytechnique, de l'INSCAE, de la MISA et de l'ISCAM prêts à s'associer.
            </p>
            
            <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                variant="indigo"
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
                className="border-border-dark bg-foreground/40 text-muted-foreground hover:bg-background/10 hover:text-background"
                asChild
              >
                <Link to="/projects">Voir les profils</Link>
              </Button>
            </div>
          </div>

          {/* Image illustrative */}
          <div className="relative w-full h-full">
            {/* Lueur de fond */}
            <div className="absolute -inset-1 bg-linear-to-tr from-primary to-secondary rounded-2xl blur-xl opacity-20" />
            <img
              src={ctaImage}
              alt="Startups sur CoFound"
              className="relative w-full max-h-[400px] object-cover rounded-2xl border border-border-dark shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
}