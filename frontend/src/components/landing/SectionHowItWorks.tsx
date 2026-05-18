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
    <section id="how-it-works" className="py-24 bg-white">
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
              <div key={step.id} className="relative flex flex-col items-center text-center">
                {/* Decorative number */}
                <span className="font-heading font-extrabold text-5xl text-primary-light select-none absolute -top-3 right-4 opacity-80">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-[260px]">
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
