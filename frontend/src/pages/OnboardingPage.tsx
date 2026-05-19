import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/shared/Avatar";

const TECH_SKILLS = ["React", "Python", "Node.js", "Figma", "Marketing", "Finance", "Droit", "Data Science", "Vente"];
const SOFT_SKILLS = ["Leadership", "Créativité", "Analyse", "Communication", "Organisation"];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [mode, setMode] = useState("idea"); // idea, project, both
  const [projectName, setProjectName] = useState("");
  const [availability, setAvailability] = useState("flexible");
  const [gender, setGender] = useState("not-specified");
  const [femalePriority, setFemalePriority] = useState(false);
  const [parityPreference, setParityPreference] = useState(false);
  const [visibility, setVisibility] = useState("public");

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/feed");
    }, 1000);
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <h1 className="font-heading font-black text-3xl tracking-tight text-foreground mb-4">
            Complète ton profil
          </h1>
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
            <span>Étape {step} sur 3</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Container */}
        <div className="bg-background border border-border rounded-2xl shadow-xs p-8 sm:p-10">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <h2 className="text-xl font-heading font-bold text-foreground">1. Ton Profil</h2>
                <div className="flex items-center gap-4">
                  <Avatar name="Utilisateur" size="lg" className="h-20 w-20 text-2xl" />
                  <Button variant="outline" size="sm">Changer de photo</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground font-semibold">Bio courte</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Décris-toi en quelques mots... (max 140 caractères)" 
                  maxLength={140}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="resize-none h-24 bg-muted/50"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground font-semibold">Tes Compétences</Label>
                <div className="flex flex-wrap gap-2">
                  {[...TECH_SKILLS, ...SOFT_SKILLS].map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedSkills.includes(skill)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-xl font-heading font-bold text-foreground">2. Ce que tu cherches</h2>
                <p className="text-sm text-muted-foreground font-medium">Définis tes objectifs sur la plateforme.</p>
              </div>

              <div className="space-y-4">
                <Label className="text-foreground font-semibold">Mode principal</Label>
                <RadioGroup value={mode} onValueChange={setMode} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className={`border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors ${mode === "idea" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setMode("idea")}>
                    <RadioGroupItem value="idea" id="mode-idea" className="sr-only" />
                    <Label htmlFor="mode-idea" className="font-bold cursor-pointer">J'ai une idée</Label>
                    <span className="text-xs text-muted-foreground font-medium">Je cherche des co-fondateurs.</span>
                  </div>
                  <div className={`border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors ${mode === "project" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setMode("project")}>
                    <RadioGroupItem value="project" id="mode-project" className="sr-only" />
                    <Label htmlFor="mode-project" className="font-bold cursor-pointer">Je cherche un projet</Label>
                    <span className="text-xs text-muted-foreground font-medium">Je veux rejoindre une équipe.</span>
                  </div>
                  <div className={`border rounded-xl p-4 flex flex-col gap-2 cursor-pointer transition-colors ${mode === "both" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setMode("both")}>
                    <RadioGroupItem value="both" id="mode-both" className="sr-only" />
                    <Label htmlFor="mode-both" className="font-bold cursor-pointer">Les deux</Label>
                    <span className="text-xs text-muted-foreground font-medium">Ouvert à toute opportunité.</span>
                  </div>
                </RadioGroup>
              </div>

              {mode === "idea" && (
                <div className="space-y-4 animate-in fade-in duration-300 bg-muted/30 p-5 rounded-xl border border-border">
                  <div className="space-y-1.5">
                    <Label htmlFor="projectName" className="text-foreground font-semibold">Nom du projet</Label>
                    <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex: HealthCare Mada" className="bg-background" />
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <Label className="text-foreground font-semibold">Ta disponibilité</Label>
                <RadioGroup value={availability} onValueChange={setAvailability} className="flex flex-col gap-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full-time" id="avail-full" />
                    <Label htmlFor="avail-full" className="font-medium cursor-pointer">Temps plein (Full-time)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="part-time" id="avail-part" />
                    <Label htmlFor="avail-part" className="font-medium cursor-pointer">Soirs & Weekends</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="flexible" id="avail-flex" />
                    <Label htmlFor="avail-flex" className="font-medium cursor-pointer">Flexible / À discuter</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-1.5">
                <h2 className="text-xl font-heading font-bold text-foreground">3. Inclusion & Visibilité</h2>
                <p className="text-sm text-muted-foreground font-medium">Aidez-nous à rendre l'écosystème plus paritaire.</p>
              </div>

              <div className="space-y-4 bg-female-light/30 border border-female/20 p-5 rounded-xl">
                <Label className="text-foreground font-semibold">Quel est votre genre ? (Optionnel)</Label>
                <p className="text-xs text-muted-foreground font-medium mb-3">Ces données sont anonymisées et alimentent notre Dashboard de Parité public.</p>
                <RadioGroup value={gender} onValueChange={setGender} className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="woman" id="gender-woman" />
                    <Label htmlFor="gender-woman" className="font-medium cursor-pointer">Femme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="man" id="gender-man" />
                    <Label htmlFor="gender-man" className="font-medium cursor-pointer">Homme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="not-specified" id="gender-none" />
                    <Label htmlFor="gender-none" className="font-medium cursor-pointer">Je préfère ne pas le dire</Label>
                  </div>
                </RadioGroup>

                {gender === "woman" && (
                  <div className="pt-4 border-t border-female/20 mt-4 animate-in fade-in slide-in-from-top-2 duration-300 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <Label className="font-semibold text-female">Activer l'Espace Sécurisé</Label>
                      <p className="text-xs font-medium text-muted-foreground">Rendre mon profil visible uniquement aux femmes en premier.</p>
                    </div>
                    <Switch checked={femalePriority} onCheckedChange={setFemalePriority} className="data-[state=checked]:bg-female" />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="font-semibold text-foreground">Équipes paritaires</Label>
                    <p className="text-xs font-medium text-muted-foreground">Privilégier les suggestions d'équipes mixtes.</p>
                  </div>
                  <Switch checked={parityPreference} onCheckedChange={setParityPreference} />
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5 flex-1">
                    <Label className="font-semibold text-foreground">Visibilité du profil</Label>
                    <p className="text-xs font-medium text-muted-foreground">{visibility === "public" ? "Visible par tous" : "Visible uniquement par les connexions"}</p>
                  </div>
                  <Switch checked={visibility === "public"} onCheckedChange={(c) => setVisibility(c ? "public" : "private")} />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handlePrev}
              disabled={step === 1 || isLoading}
              className={step === 1 ? "invisible" : ""}
            >
              Précédent
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} size="md">
                Suivant
              </Button>
            ) : (
              <Button onClick={handleFinish} size="md" disabled={isLoading} className="bg-female hover:bg-female/90 text-white">
                {isLoading ? "Finalisation..." : "Terminer et Explorer"}
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
