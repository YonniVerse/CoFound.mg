import { UserPlus, Search, Handshake, type LucideIcon } from "lucide-react";

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
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-slate-100 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Minimaliste */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Le Pipeline CoFound
          </span>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-slate-950 mt-4 tracking-tight">
            Du profil solo à la startup prête pour l'incubation
          </h2>
        </div>

        {/* Pipeline Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Ligne de flux horizontale élégante (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-linear-to-r from-indigo-200 via-orange-200 to-slate-200 pointer-events-none" />

          {steps.map((step, idx) => {
            const Icon = iconMap[step.icon] || UserPlus;
            // Aligner les bordures d'accentuation sur le parcours utilisateur
            const accentColors = [
              "border-indigo-500 text-indigo-600 bg-indigo-50",
              "border-slate-950 text-slate-950 bg-slate-50",
              "border-orange-500 text-orange-600 bg-orange-50"
            ];

            return (
              <div 
                key={step.id} 
                className="relative bg-white border border-slate-200/70 rounded-2xl p-8 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col items-start"
              >
                {/* Badge Étape Numérique */}
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold mb-6 relative z-10 ${accentColors[idx]}`}>
                  0{step.number || idx + 1}
                </div>

                {/* Conteneur de l'icône */}
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>

                {/* Titre & Description */}
                <h3 className="font-sans font-bold text-lg text-slate-950 mb-2 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed font-normal">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}