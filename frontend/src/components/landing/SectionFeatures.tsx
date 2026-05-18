import { Zap, MessageSquare, Rocket, LineChart, type LucideIcon } from "lucide-react";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface SectionFeaturesProps {
  features: Feature[];
}

const iconMap: Record<string, LucideIcon> = {
  Zap,
  MessageSquare,
  Rocket,
  LineChart,
};

export function SectionFeatures({ features }: SectionFeaturesProps) {
  return (
    <section className="py-24 bg-background border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-muted border border-border px-4 py-1.5 mb-6">
            <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Tout ce dont vous avez besoin
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-foreground">
            Les outils pour réussir
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Une plateforme pensée pour faciliter les rencontres et accélérer vos premiers pas d'entrepreneurs.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || Zap;

            return (
              <div
                key={feature.id}
                className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-muted border border-border/50 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}