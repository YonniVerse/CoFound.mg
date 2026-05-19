import { useNavigate } from "react-router-dom";
import { Hammer, ArrowLeft, Rocket } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        
        {/* Icône décorative */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          <div className="h-24 w-24 bg-background border border-border shadow-xl rounded-3xl flex items-center justify-center relative z-10 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Hammer className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 h-10 w-10 bg-secondary/10 border border-secondary/20 rounded-full flex items-center justify-center z-20 animate-bounce">
            <Rocket className="h-4 w-4 text-secondary" />
          </div>
        </div>

        {/* Texte */}
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-foreground tracking-tight mb-4">
          Bientôt disponible
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto mb-8">
          Cette fonctionnalité est prévue dans notre roadmap post-hackathon ! Nous nous concentrons actuellement sur l'expérience clé du MVP.
        </p>

        {/* Actions */}
        <Button size="xl" onClick={() => navigate(-1)} className="shadow-lg shadow-primary/20">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retourner en arrière
        </Button>

      </div>
    </DashboardLayout>
  );
}
