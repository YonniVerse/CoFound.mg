import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionCTA() {
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white">
          Prêt à trouver ton équipe ?
        </h2>
        <p className="mt-3 text-green-100 text-base sm:text-lg">
          Rejoins 847 étudiants qui construisent l'avenir de Madagascar.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button
            size="lg"
            className="bg-white text-green-700 hover:bg-green-50 rounded-lg h-12 px-8 font-heading font-semibold"
            asChild
          >
            <Link to="/signup">
              Créer mon profil gratuitement <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-white text-white hover:bg-white/10 rounded-lg h-12 px-8"
            asChild
          >
            <Link to="/projects">Voir les projets</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
