import { SkillTag } from "@/components/shared/SkillTag";
import { useI18n } from '@/i18n';
import { 
  ArrowRightLeft,
  Laptop,
  Briefcase,
  Stethoscope,
  Palette,
  Scale,
  type LucideIcon
} from "lucide-react";

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

const iconMap: Record<string, LucideIcon> = {
  Laptop,
  Briefcase,
  Stethoscope,
  Palette,
  Scale,
};

export function SectionForWho({ profileTypes }: SectionForWhoProps) {
  const { t } = useI18n()
  const translate = (key: string) => t(key as Parameters<typeof t>[0])
  return (
    <section className="py-24 bg-foreground text-background relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Minimaliste style YC */}
        <div className="max-w-3xl mb-20">
          <p className="text-xs uppercase font-bold tracking-widest text-primary-light/80 mb-3">{t('landing.forWho.eyebrow')}</p>
          <h2 className="font-sans font-black text-4xl sm:text-5xl tracking-tight leading-none text-background">
            {t('landing.forWho.title')}
          </h2>
        </div>

        {/* Grid System Typé Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileTypes.map((profile) => {
            const Icon = iconMap[profile.icon] || Laptop;
            return (
            <div
              key={profile.id}
              className="bg-foreground/40 border border-border-dark/60 rounded-2xl p-6 flex flex-col justify-between hover:border-border-dark transition-all duration-200 group"
            >
              <div>
                {/* Top Section */}
                <div className="flex items-center justify-between border-b border-border-dark/40 pb-4 mb-5">
                  <h3 className="font-bold text-lg tracking-tight text-background">{translate(`landing.profileTypes.${profile.id}.title`)}</h3>
                  <div className="p-2.5 bg-border-dark/30 rounded-xl group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-background" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Loquet "Brings" (Superpouvoirs) */}
                <div className="mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light block mb-2">
                    {t('landing.forWho.brings')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.brings.map((skill) => (
                      <SkillTag key={skill} label={translate(`landing.profileTypes.${profile.id}.bring-${profile.brings.indexOf(skill)}`)} variant="indigo" className="bg-primary/20 text-primary-light border-none" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Loquet "Seeks" (Besoins) */}
              <div className="pt-4 border-t border-border-dark/30 mt-auto">
                <div className="flex items-center gap-1.5 mb-2">
                  <ArrowRightLeft className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block">
                    {t('landing.forWho.seeks')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.seeks.map((skill) => (
                      <SkillTag key={skill} label={translate(`landing.profileTypes.${profile.id}.seek-${profile.seeks.indexOf(skill)}`)} variant="orange" className="bg-secondary/20 text-secondary-light border-none" />
                  ))}
                </div>
              </div>

            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}