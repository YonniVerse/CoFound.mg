import { SkillTag } from "@/components/shared/SkillTag";

interface ProfileType {
  id: string;
  icon: string;
  title: string;
  brings: string[];
  seeks: string[];
}

interface SectionForWhoProps {
  profileTypes: ProfileType[];
}

export function SectionForWho({ profileTypes }: SectionForWhoProps) {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
            Fait pour tous les profils
          </h2>
          <p className="mt-3 text-slate-500 text-base">
            La complémentarité crée les meilleures équipes.
          </p>
        </div>

        {/* Profiles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {profileTypes.map((profile) => (
            <div
              key={profile.id}
              className="bg-white border border-slate-200/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1 group"
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center mb-4 text-lg">
                {profile.icon}
              </div>

              {/* Title */}
              <h3 className="font-heading font-semibold text-sm text-slate-900 mb-4">
                {profile.title}
              </h3>

              {/* Brings */}
              <div className="mb-3">
                <span className="text-[11px] font-medium uppercase tracking-wide text-green-600 block mb-1.5">
                  Ce qu'il apporte
                </span>
                <div className="flex flex-wrap gap-1">
                  {profile.brings.map((skill) => (
                    <SkillTag key={skill} label={skill} variant="green" size="sm" />
                  ))}
                </div>
              </div>

              {/* Seeks */}
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400 block mb-1.5">
                  Ce qu'il cherche
                </span>
                <div className="flex flex-wrap gap-1">
                  {profile.seeks.map((skill) => (
                    <SkillTag key={skill} label={skill} variant="slate" size="sm" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
