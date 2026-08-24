import { UserPlus, Search, Handshake, type LucideIcon } from "lucide-react";
import { useI18n } from '@/i18n';

interface Step {
  id: string;
  number: string;
  icon: string;
  title: string;
  description: string;
}

interface SectionHowItWorksProps {
  steps: Step[];
}

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Search,
  Handshake,
};

export function SectionHowItWorks({ steps }: SectionHowItWorksProps) {
  const { t } = useI18n()
  const translate = (key: string) => t(key as Parameters<typeof t>[0])
  return (
    <section id="how-it-works" className="py-24 bg-background border-t border-border/40 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Minimaliste */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary-light px-3 py-1 rounded-full">
            {t('landing.how.eyebrow')}
          </span>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-foreground mt-4 tracking-tight">
            {t('landing.how.title')}
          </h2>
        </div>

        {/* Pipeline Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Ligne de flux horizontale élégante (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-linear-to-r from-primary/30 via-secondary/30 to-border/40 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = iconMap[step.icon] || UserPlus;
            
            // Alignement dynamique sur les rôles de ton design system
            const accentColors = [
              "border-primary text-primary bg-primary-light",
              "border-foreground text-foreground bg-muted",
              "border-secondary text-secondary bg-secondary-light"
            ];

            return (
              <div 
                key={step.id} 
                className="relative bg-card border border-border/70 rounded-2xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col items-start"
              >
                {/* Badge Étape Numérique */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold mb-6 relative z-10 ${accentColors[idx] || accentColors[1]}`}>
                  0{step.number || idx + 1}
                </div>

                {/* Conteneur de l'icône */}
                <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Titre & Description */}
                <h3 className="font-sans font-bold text-lg text-foreground mb-2 tracking-tight">
                  {translate(`landing.steps.step-${idx + 1}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-normal">
                  {translate(`landing.steps.step-${idx + 1}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}