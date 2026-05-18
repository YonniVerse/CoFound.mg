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
    <section id="how-it-works" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
            Comment ça marche ?
          </h2>
          <p className="mt-3 text-slate-500 text-base">Trois étapes. Pas plus.</p>
        </div>

        {/* Steps grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-16 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] border-t-2 border-dashed border-slate-200" />

          {steps.map((step) => {
            const Icon = iconMap[step.icon] || UserPlus;

            return (
              <div key={step.id} className="relative flex flex-col items-center text-center bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1">
                {/* Decorative number */}
                <span className="font-heading font-extrabold text-7xl text-slate-50 select-none absolute -top-4 right-4 pointer-events-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-4 ring-white">
                  <Icon className="w-7 h-7 text-primary" strokeWidth={2} />
                </div>

                {/* Text */}
                <h3 className="font-heading font-semibold text-xl text-slate-900 mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[260px] relative z-10">
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
