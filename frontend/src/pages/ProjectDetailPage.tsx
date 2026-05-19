import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Share2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar } from "@/components/shared/Avatar";
import { SectorBadge } from "@/components/shared/SectorBadge";
import { FemaleBadge } from "@/components/shared/FemaleBadge";
import { SkillTag } from "@/components/shared/SkillTag";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const PROJECT_MOCK = {
  id: "p1",
  title: "EcoDrive - Mobilité verte universitaire",
  sector: "EdTech" as const,
  isFemaleImpact: false,
  date: "Publié il y a 2 heures",
  status: "Idéation & MVP en cours",
  availability: "Flexible / Soirs & Weekends",
  problem: "Les étudiants malgaches perdent énormément de temps et d'argent dans les transports en commun saturés ou les taxis-be pour rejoindre les campus éloignés (ex: Vontovorona). L'empreinte carbone est élevée et le confort d'étude est impacté par la fatigue du trajet.",
  solution: "EcoDrive est une application mobile de covoiturage exclusivement réservée aux étudiants et professeurs avec vérification d'identité (carte étudiante). Elle permet de partager les frais de carburant et de créer un réseau d'entraide sécurisé sur les trajets universitaires.",
  team: [
    { name: "Rina Andria", role: "CEO & Fondatrice", school: "Polytechnique", avatar: null },
    { name: "Marc T.", role: "Lead Développeur", school: "MISA", avatar: null }
  ],
  seeking: [
    { role: "Développeur React Native", desc: "Pour créer la V1 de l'application mobile (iOS/Android)." },
    { role: "Responsable Marketing", desc: "Pour la stratégie de lancement sur les campus et l'acquisition d'utilisateurs." }
  ],
  skills: ["Dev React Native", "Marketing", "UI Design"]
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [applicationText, setApplicationText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // In a real app, fetch project by ID. Here we use MOCK.
  const project = PROJECT_MOCK;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsDialogOpen(false);
      setApplicationText("");
      // Alert as simple MVP feedback
      alert("Félicitations ! Votre candidature a bien été envoyée à l'équipe.");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-8">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* MAIN COLUMN */}
          <div className="flex-1 space-y-10 animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <SectorBadge sector={project.sector} />
                {project.isFemaleImpact && <FemaleBadge />}
              </div>
              <h1 className="font-heading font-black text-4xl sm:text-5xl text-foreground leading-tight">
                {project.title}
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {project.date} · #{id}
              </p>
            </div>

            {/* Content Blocks */}
            <div className="space-y-8 text-foreground">
              
              <div className="space-y-3">
                <h2 className="font-heading font-bold text-2xl">Le Problème</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {project.problem}
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="font-heading font-bold text-2xl">La Solution</h2>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {project.solution}
                </p>
              </div>

              <div className="space-y-5">
                <h2 className="font-heading font-bold text-2xl">Ce qu'on cherche</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.skills.map(skill => (
                    <SkillTag key={skill} label={skill} variant="indigo" size="md" />
                  ))}
                </div>
                <div className="grid gap-4">
                  {project.seeking.map((seek, idx) => (
                    <div key={idx} className="bg-muted/30 border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                      <h4 className="font-bold text-lg mb-1">{seek.role}</h4>
                      <p className="text-sm text-muted-foreground font-medium">{seek.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            
            {/* Action Card */}
            <div className="bg-background border border-border shadow-xs rounded-2xl p-6 flex flex-col gap-5 sticky top-[100px] animate-in fade-in slide-in-from-right-8 duration-500 delay-100">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="xl" className="w-full text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                    Postuler à ce projet
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading text-2xl">Exprimer mon intérêt</DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                      Expliquez rapidement à l'équipe pourquoi vous seriez le/la partenaire idéal(e) pour ce projet.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="bg-muted/50 p-4 rounded-xl border border-border flex gap-4 items-center">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Send className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Candidature directe</p>
                        <p className="text-xs text-muted-foreground font-medium">Votre profil complet sera automatiquement partagé avec l'équipe.</p>
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Bonjour, je suis très intéressé(e) par votre vision. Ayant déjà travaillé sur..." 
                      className="min-h-[150px] resize-none bg-muted/50"
                      value={applicationText}
                      onChange={(e) => setApplicationText(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isApplying}>Annuler</Button>
                    <Button onClick={handleApply} disabled={isApplying || applicationText.trim() === ""}>
                      {isApplying ? "Envoi en cours..." : "Envoyer ma candidature"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-muted/50 font-semibold">Sauvegarder</Button>
                <Button variant="outline" className="px-3 bg-muted/50" title="Partager">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="border-t border-border pt-5 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Stade actuel</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-secondary"></span>
                    {project.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Disponibilité souhaitée</p>
                  <p className="text-sm font-semibold text-foreground">{project.availability}</p>
                </div>
              </div>
            </div>

            {/* Team Card */}
            <div className="bg-background border border-border shadow-xs rounded-2xl p-6 animate-in fade-in slide-in-from-right-8 duration-500 delay-200">
              <h3 className="font-heading font-bold text-lg mb-4">L'Équipe actuelle</h3>
              <div className="space-y-4">
                {project.team.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Avatar name={member.name} size="sm" className="h-10 w-10 border border-border" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground leading-tight">{member.name}</span>
                      <span className="text-xs text-primary font-bold">{member.role}</span>
                      <span className="text-xs text-muted-foreground font-medium">{member.school}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
