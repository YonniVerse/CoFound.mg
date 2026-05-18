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
    <section className="py-24 bg-linear-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-700 tracking-wide">
            Notre Engagement Social
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-6">
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-slate-900 leading-tight">
            50% des talents.
            <br />
            Pleinement impliquées.
          </h2>
        </div>

        {/* Stat */}
        <p className="text-center max-w-xl mx-auto text-slate-600 text-base sm:text-lg leading-relaxed mb-16">
          Moins de 20% des fondateurs de startups en Afrique sont des femmes.
          <br className="hidden sm:block" />
          <strong className="text-slate-800">CoFound.mg change ça structurellement.</strong>
        </p>

        {/* 3 mechanisms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature) => (
            <div key={feature.id} className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
              <div className="text-3xl mb-6 w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                {feature.icon}
              </div>
              <h3 className="font-heading font-semibold text-lg text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Blockquote */}
        <div className="max-w-2xl mx-auto">
          <blockquote className="border-l-4 border-primary pl-5 py-2">
            <p className="font-heading font-semibold italic text-lg sm:text-xl text-slate-700">
              &ldquo;Pas de quotas. On supprime les barrières invisibles.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
