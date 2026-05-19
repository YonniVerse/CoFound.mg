// --- Component ---
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// --- Helper Components & Data ---

// All text data and images are the updated versions.
const testimonials = [
  {
    quote:
      "J'avais une idée d'application e-santé mais je ne savais pas coder. CoFound m'a permis de rencontrer un développeur de l'ENI en moins de 48 heures. Aujourd'hui, on lance notre MVP.",
    name: "Hery Rakoto",
    designation: "Étudiant en Médecine, Faculté de Médecine Antananarivo",
    src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "En tant que femme en tech, j'hésitais à me lancer et partager mes idées. L'espace sécurisé de CoFound m'a vraiment rassurée. J'ai pu être mentorée et trouver une équipe bienveillante.",
    name: "Mialy Randria",
    designation: "Étudiante en Informatique, École Polytechnique (ESPA)",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Je cherchais un projet technique à rejoindre pour apporter mon expertise en marketing digital. C'est l'outil parfait pour décloisonner nos campus.",
    name: "Fanja Andriam",
    designation: "Étudiante en Marketing, ISCAM",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "La complémentarité des profils fait toute la différence. Trouver un associé en gestion quand on est 100% développeur, c'était impossible avant.",
    name: "Njaka Tahina",
    designation: "Développeur Fullstack, IT University",
    src: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote:
      "Le tableau de bord de parité est une idée géniale. Ça montre que la plateforme s'engage vraiment pour l'inclusion des femmes dans l'entrepreneuriat.",
    name: "Kanto Andriana",
    designation: "Étudiante en Droit, CNTEMAD",
    src: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

// --- Main Animated Testimonials Component ---
// This is the core component that handles the animation and logic.
const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext]);

  const isActive = (index: number) => index === active;

  const randomRotate = () => `${Math.floor(Math.random() * 16) - 8}deg`;

  return (
    <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12">
      <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-2 md:gap-x-20">
        {/* Image Section */}
        <div className="flex items-center justify-center">
            <div className="relative h-80 w-full max-w-xs">
              <AnimatePresence>
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.src}
                    // Animation properties reverted to the previous version.
                    initial={{ opacity: 0, scale: 0.9, y: 50, rotate: randomRotate() }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.5,
                      scale: isActive(index) ? 1 : 0.9,
                      y: isActive(index) ? 0 : 20,
                      zIndex: isActive(index) ? testimonials.length : testimonials.length - Math.abs(index - active),
                      rotate: isActive(index) ? '0deg' : randomRotate(),
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom"
                    style={{ perspective: '1000px' }}
                  >
                    <img
                      src={testimonial.src}
                      alt={testimonial.name}
                      width={500}
                      height={500}
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover shadow-2xl"
                      onError={(e) => {
                        e.currentTarget.src = `https://placehold.co/500x500/e2e8f0/64748b?text=${testimonial.name.charAt(0)}`;
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
        </div>

        {/* Text and Controls Section */}
        <div className="flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              // Animation properties reverted to the previous version.
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col justify-between"
            >
                <div>
                    <h3 className="text-2xl font-bold text-foreground">
                        {testimonials[active].name}
                    </h3>
                    <p className="text-sm text-primary">
                        {testimonials[active].designation}
                    </p>
                    <motion.p className="mt-8 text-lg text-muted-foreground leading-relaxed">
                        "{testimonials[active].quote}"
                    </motion.p>
                </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-4 pt-12">
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-border/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ArrowLeft className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:-translate-x-1" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="group flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-border/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <ArrowRight className="h-5 w-5 text-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Demo Component ---
function AnimatedTestimonialsDemo() {
  return <AnimatedTestimonials testimonials={testimonials} />;
}


// --- Main App Component ---
// This is the root of our application.
export function Component() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Animated grid background with 10% opacity */}
        <style>
            {`
                @keyframes animate-grid {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
                .animated-grid {
                    width: 200%;
                    height: 200%;
                    /* Grid color for light and dark mode */
                    background-image: 
                        linear-gradient(to right, #e2e8f0 1px, transparent 1px), 
                        linear-gradient(to bottom, #e2e8f0 1px, transparent 1px);
                    background-size: 3rem 3rem;
                    animation: animate-grid 40s linear infinite alternate;
                }
                .dark .animated-grid {
                    background-image: 
                        linear-gradient(to right, #1e293b 1px, transparent 1px), 
                        linear-gradient(to bottom, #1e293b 1px, transparent 1px);
                }
            `}
        </style>
        <div className="animated-grid absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10" />
        
        {/* Content */}
        <div className="z-10">
            <AnimatedTestimonialsDemo />
        </div>
    </div>
  );
}


// --- Demo ---
import { Component } from "@/components/ui/testimonial";

export default function DemoOne() {
  return <Component />;
}
