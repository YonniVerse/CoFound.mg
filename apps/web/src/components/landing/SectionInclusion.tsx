import { FemaleBadge } from "@/components/shared/FemaleBadge";
import { 
  Shield, 
  Users, 
  BarChart3, 
  type LucideIcon 
} from "lucide-react";

interface InclusionFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SectionInclusionProps {
  features: InclusionFeature[];
}

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Users,
  BarChart3,
};

export function SectionInclusion({ features }: SectionInclusionProps) {
  return (
    <section className="py-24 bg-female-light/50 border-t border-b border-female/10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Layout asymétrique : Titre à gauche, métrique clé à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16 pb-12 border-b border-female/20">
          <div className="lg:col-span-8">
            <FemaleBadge variant="project" className="mb-6 scale-110 origin-left" />
            <h2 className="font-sans font-black text-4xl sm:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.05]">
              50% des talents.<br/>
              <span className="text-female">Pleinement impliquées.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <div className="inline-block text-left">
              <span className="font-sans font-black text-6xl text-female tracking-tighter block leading-none">
                <span className="text-4xl align-top">&lt;</span>20%
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block mt-2">
                Des fondateurs en Afrique sont des femmes.
              </span>
            </div>
          </div>
        </div>

        {/* Les Piliers d'actions mécaniques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Shield;
            return (
              <div 
                key={feature.id} 
                className="bg-card rounded-2xl p-8 border border-border/70 shadow-sm hover:shadow-md hover:border-female/40 transition-all duration-300 group"
              >
                <div className="text-xl mb-6 w-12 h-12 bg-female-light text-female rounded-xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
              <h3 className="font-sans font-bold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                {feature.description}
              </p>
            </div>
            );
          })}
        </div>

        {/* Citation de Manifeste épuré */}
        <div className="max-w-4xl mx-auto border-l-4 border-female pl-8 py-2">
          <p className="font-heading font-semibold italic text-2xl md:text-3xl text-foreground/90 leading-tight">
            « Nous refusons de reproduire les mêmes biais à Madagascar. CoFound supprime les barrières structurelles invisibles dès le premier jour. »
          </p>
        </div>

      </div>
    </section>
  );
}