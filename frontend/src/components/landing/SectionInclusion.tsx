import { FemaleBadge } from "@/components/shared/FemaleBadge";

interface InclusionFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SectionInclusionProps {
  features: InclusionFeature[];
}

export function SectionInclusion({ features }: SectionInclusionProps) {
  return (
    <section className="py-24 bg-muted border-t border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Layout asymétrique : Titre à gauche, métrique clé à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16 pb-12 border-b border-border">
          <div className="lg:col-span-7">
            <FemaleBadge variant="project" className="mb-4" />
            <h2 className="font-sans font-black text-4xl sm:text-5xl text-foreground tracking-tight leading-[0.95]">
              Casser les barrières invisibles. Structurellement.
            </h2>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <div className="inline-block text-left">
              <span className="font-sans font-black text-6xl text-female tracking-tighter block leading-none">
                50%
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mt-1">
                Objectif strict de mixité dans le vivier
              </span>
            </div>
          </div>
        </div>

        {/* Les Piliers d'actions mécaniques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="bg-card rounded-xl p-6 border border-border/70 shadow-2xs hover:border-female/30 transition-colors"
            >
              <div className="text-xl mb-4 w-10 h-10 bg-female-light text-female rounded-lg flex items-center justify-center font-bold">
                {feature.icon || "✓"}
              </div>
              <h3 className="font-sans font-bold text-base text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Citation de Manifeste épuré */}
        <div className="max-w-3xl mx-auto border-l-2 border-female pl-6 py-1">
          <p className="font-sans font-medium italic text-lg text-foreground/90 leading-relaxed">
            « Moins de 20% des fondateurs en Afrique sont des femmes. Nous refusons de reproduire ce schéma à Madagascar. CoFound supprime les biais dès le premier jour. »
          </p>
        </div>

      </div>
    </section>
  );
}