import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useI18n } from '@/i18n';

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
  const { t } = useI18n();
  const translate = (key: string) => t(key as Parameters<typeof t>[0])
  const [active, setActive] = useState(0);

  const handleNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(handleNext, 6000);
    return () => clearInterval(interval);
  }, [handleNext]);

  const isActive = (index: number) => index === active;

  // Static rotations to avoid hydration mismatches
  const getRotation = (index: number) => {
    const rotations = [-6, 4, -5, 3, -4, 5, -3, 6];
    return `${rotations[index % rotations.length]}deg`;
  };

  if (!testimonials || testimonials.length === 0) return null;

  const current = testimonials[active];
  if (!current) return null;

  return (
    <section className="py-24 bg-background border-t border-border/40 overflow-hidden relative">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-[0.03] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t('landing.testimonials.eyebrow')}</p>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-foreground tracking-tight mt-3">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-base text-muted-foreground mt-3 font-normal">
            Ils ont rencontré leur moitié business ou technique sur la plateforme.
          </p>
        </div>

        {/* Animated Carousel */}
        <div className="mx-auto max-w-sm font-sans antialiased md:max-w-4xl px-4 lg:px-8">
          <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-20">
            
            {/* Image Stack */}
            <div className="flex items-center justify-center">
              <div className="relative h-80 w-full max-w-xs">
                <AnimatePresence>
                  {testimonials.map((testimonial, index) => {
                    const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=f1f5f9&color=090d16&size=500`;
                    return (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, scale: 0.9, y: 50, rotate: getRotation(index) }}
                        animate={{
                          opacity: isActive(index) ? 1 : 0.4,
                          scale: isActive(index) ? 1 : 0.9,
                          y: isActive(index) ? 0 : 20,
                          zIndex: isActive(index) ? testimonials.length : testimonials.length - Math.abs(index - active),
                          rotate: isActive(index) ? '0deg' : getRotation(index),
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 origin-bottom"
                        style={{ perspective: '1000px' }}
                      >
                        <img
                          src={testimonial.avatar || fallbackImage}
                          alt={testimonial.name}
                          draggable={false}
                          className="h-full w-full rounded-3xl object-cover shadow-2xl border border-border/50 bg-muted"
                          onError={(e) => {
                            e.currentTarget.src = fallbackImage;
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Text & Controls */}
            <div className="flex flex-col justify-center py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-2xl font-bold font-sans tracking-tight text-foreground">
                      {current.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      {current.school} <span className="mx-1">·</span> {translate(`landing.testimonials.${current.id}.field`)}
                    </p>
                    <motion.p className="mt-8 text-lg text-foreground/90 leading-relaxed italic">
                      "{translate(`landing.testimonials.${current.id}.quote`)}"
                    </motion.p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex gap-4 pt-10">
                <button
                  onClick={handlePrev}
                  aria-label={t('landing.testimonials.previous')}
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-muted border border-border transition-colors hover:bg-border/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-x-1" />
                </button>
                <button
                  onClick={handleNext}
                  aria-label={t('landing.testimonials.next')}
                  className="group flex h-11 w-11 items-center justify-center rounded-full bg-muted border border-border transition-colors hover:bg-border/60 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <ArrowRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}