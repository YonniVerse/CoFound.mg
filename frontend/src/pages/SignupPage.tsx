import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ctaImage from "@/assets/images/cta.jpg";

const SCHOOLS = [
  "École Polytechnique de Madagascar",
  "ISCAM",
  "INSCAE",
  "IAG",
  "Faculté de Médecine",
  "MISA",
  "IST",
  "Autre"
];

export default function SignupPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    field: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, school: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, acceptTerms: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!formData.acceptTerms) {
      alert("Vous devez accepter les CGU.");
      return;
    }

    setIsLoading(true);
    // Simuler un délai réseau
    setTimeout(() => {
      setIsLoading(false);
      navigate("/onboarding");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Colonne de Gauche : Branding (Caché sur mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-foreground overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border-dark)_1px,transparent_1px)] bg-size-[24px_24px] opacity-20 pointer-events-none" />
        <img
          src={ctaImage}
          alt="Étudiants entrepreneurs"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-10 p-12 max-w-lg text-left">
          <Link to="/" className="inline-flex items-center gap-0.5 mb-16 group">
            <span className="font-heading font-black text-3xl tracking-tight text-background">CoFound</span>
            <span className="font-heading text-3xl font-black text-primary transition-colors group-hover:text-secondary">.mg</span>
          </Link>
          <h1 className="font-sans font-black text-5xl text-background leading-[1.1] tracking-tight mb-6">
            L'aventure commence avec la bonne équipe.
          </h1>
          <p className="text-lg text-muted-foreground/80 font-medium">
            Rejoignez l'élite entrepreneuriale étudiante de Madagascar. Trouvez les compétences qui vous manquent.
          </p>
        </div>
      </div>

      {/* Colonne de Droite : Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight mb-2">Créer un compte</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Déjà fondateur sur la plateforme ?{" "}
              <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-foreground font-semibold">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="Hery"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-muted/50 border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-foreground font-semibold">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Rakoto"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-muted/50 border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground font-semibold">Email universitaire</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="hery.rakoto@ecole.mg"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-muted/50 border-border"
              />
              <p className="text-xs text-muted-foreground mt-1 font-medium">Utilisez votre email d'école pour la vérification rapide.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="school" className="text-foreground font-semibold">École ou Université</Label>
              <Select required onValueChange={handleSelectChange} value={formData.school}>
                <SelectTrigger id="school" className="bg-muted/50 border-border h-10 w-full">
                  <SelectValue placeholder="Sélectionnez votre établissement" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map((school) => (
                    <SelectItem key={school} value={school}>{school}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field" className="text-foreground font-semibold">Filière / Domaine d'études</Label>
              <Input
                id="field"
                name="field"
                placeholder="ex: Informatique, Gestion, Design..."
                required
                value={formData.field}
                onChange={handleChange}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground font-semibold">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-foreground font-semibold">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-muted/50 border-border"
              />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={handleCheckboxChange}
                className="mt-0.5 border-border data-[state=checked]:bg-primary"
              />
              <div className="grid leading-none">
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium leading-relaxed text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J'accepte les{" "}
                  <a href="#" className="text-primary hover:underline font-semibold">Conditions d'utilisation</a>
                  {" "}et la{" "}
                  <a href="#" className="text-primary hover:underline font-semibold">Politique de confidentialité</a>.
                </Label>
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer mon compte fondateur"}
            </Button>
          </form>
          
        </div>
      </div>
    </div>
  );
}
