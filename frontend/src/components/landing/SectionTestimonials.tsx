import { Avatar } from "@/components/shared/Avatar";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  school: string;
  field: string;
  avatar: string | null;
}

interface SectionTestimonialsProps {
  testimonials: Testimonial[];
}

export function SectionTestimonials({ testimonials }: SectionTestimonialsProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-lg mx-auto mb-16">
          <h2 className="font-sans font-black text-3xl text-slate-950 tracking-tight">
            Validé par les étudiants fondateurs
          </h2>
          <p className="text-sm text-slate-500 mt-2 font-normal">
            Ils ont rencontré leur moitié business ou technique sur la plateforme.
          </p>
        </div>

        {/* Review Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <p className="text-slate-700 text-sm leading-relaxed font-normal mb-6">
                “{testimonial.quote}”
              </p>

              {/* Auteur Profil */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-auto">
                <Avatar name={testimonial.name} src={testimonial.avatar} size="sm" />
                <div className="overflow-hidden">
                  <h4 className="font-sans font-bold text-xs text-slate-950 truncate">
                    {testimonial.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {testimonial.school} · {testimonial.field}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}