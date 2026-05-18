import { SkillTag } from "@/components/shared/SkillTag";
import { ArrowRightLeft } from "lucide-react";

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
    <section className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Minimaliste style YC */}
        <div className="max-w-3xl mb-20">
          <p className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-3">La loi de la complémentarité</p>
          <h2 className="font-sans font-black text-4xl sm:text-5xl tracking-tight leading-none text-white">
            Peu importe ta formation, ta pièce manquante est ici.
          </h2>
        </div>

        {/* Grid System Typé Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileTypes.map((profile) => (
            <div
              key={profile.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group"
            >
              <div>
                {/* Top Section */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
                  <h3 className="font-bold text-lg tracking-tight text-white">{profile.title}</h3>
                  <span className="text-2xl p-2 bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">{profile.icon}</span>
                </div>

                {/* Loquet "Brings" */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
                    Superpouvoirs à offrir
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.brings.map((skill) => (
                      <SkillTag key={skill} label={skill} variant="purple" className="bg-emerald-500/10 text-emerald-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Loquet "Seeks" */}
              <div className="pt-4 border-t border-slate-800/60 mt-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowRightLeft className="h-3 w-3 text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                    Besoins critiques recherchés
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.seeks.map((skill) => (
                    <SkillTag key={skill} label={skill} variant="slate" className="bg-slate-800 text-slate-300" />
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