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
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl text-slate-900">
            Ils l'ont vécu
          </h2>
        </div>

        {/* Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              {/* Quote mark */}
              <span className="font-heading font-extrabold text-5xl text-green-200 leading-none select-none block mb-2">
                &ldquo;
              </span>

              {/* Quote text */}
              <p className="text-slate-700 italic text-sm leading-relaxed mb-6">
                {testimonial.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <Avatar name={testimonial.name} size="sm" />
                <div>
                  <p className="font-heading font-semibold text-sm text-slate-900">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-slate-500">
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
