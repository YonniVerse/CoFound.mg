import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { LanguageSwitcher, useI18n } from "@/i18n";

const SCHOOLS = [
  ["polytechnique", "signup.schoolPolytechnique"],
  ["iscam", "signup.schoolIscam"],
  ["inscae", "signup.schoolInscae"],
  ["iag", "signup.schoolIag"],
  ["medicine", "signup.schoolMedicine"],
  ["misa", "signup.schoolMisa"],
  ["ist", "signup.schoolIst"],
  ["other", "signup.schoolOther"],
] as const;

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    school: "",
    field: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, school: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t("signup.passwordMismatch"));
      return;
    }
    if (!formData.acceptTerms) {
      alert(t("signup.acceptTerms"));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/onboarding");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="hidden lg:flex w-1/2 relative bg-foreground overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(var(--border-dark)_1px,transparent_1px)] bg-size-[24px_24px] opacity-20 pointer-events-none" />
        <img
          src={ctaImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
        <div className="relative z-10 p-12 max-w-lg text-left">
          <Link to="/" className="inline-flex items-center gap-0.5 mb-16 group">
            <span className="font-heading font-black text-3xl tracking-tight text-background">CoFound</span>
            <span className="font-heading text-3xl font-black text-primary transition-colors group-hover:text-secondary">.mg</span>
          </Link>
          <h1 className="font-sans font-black text-5xl text-background leading-[1.1] tracking-tight mb-6">
            {t("signup.heroTitle")}
          </h1>
          <p className="text-lg text-muted-foreground/80 font-medium">{t("signup.heroBody")}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              {t("signup.backHome")}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-heading font-bold text-foreground tracking-tight mb-2">{t("signup.title")}</h2>
            <p className="text-sm text-muted-foreground font-medium">
              {t("signup.alreadyFounder")} {" "}
              <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
                {t("signup.signIn")}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-foreground font-semibold">{t("signup.firstName")}</Label>
                <Input id="firstName" name="firstName" placeholder={t("signup.exampleFirstName")} required value={formData.firstName} onChange={handleChange} className="bg-muted/50 border-border" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-foreground font-semibold">{t("signup.lastName")}</Label>
                <Input id="lastName" name="lastName" placeholder={t("signup.exampleLastName")} required value={formData.lastName} onChange={handleChange} className="bg-muted/50 border-border" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground font-semibold">{t("signup.email")}</Label>
              <Input id="email" name="email" type="email" placeholder={t("signup.exampleEmail")} required value={formData.email} onChange={handleChange} className="bg-muted/50 border-border" />
              <p className="text-xs text-muted-foreground mt-1 font-medium">{t("signup.emailHint")}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="school" className="text-foreground font-semibold">{t("signup.school")}</Label>
              <Select required onValueChange={handleSelectChange} value={formData.school}>
                <SelectTrigger id="school" className="bg-muted/50 border-border h-10 w-full">
                  <SelectValue placeholder={t("signup.schoolPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map(([value, labelKey]) => (
                    <SelectItem key={value} value={value}>{t(labelKey as Parameters<typeof t>[0])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="field" className="text-foreground font-semibold">{t("signup.field")}</Label>
              <Input id="field" name="field" placeholder={t("signup.fieldPlaceholder")} required value={formData.field} onChange={handleChange} className="bg-muted/50 border-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-foreground font-semibold">{t("signup.password")}</Label>
              <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="bg-muted/50 border-border" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-foreground font-semibold">{t("signup.confirmPassword")}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="bg-muted/50 border-border" />
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Checkbox id="terms" checked={formData.acceptTerms} onCheckedChange={handleCheckboxChange} className="mt-0.5 border-border data-[state=checked]:bg-primary" />
              <div className="grid leading-none">
                <Label htmlFor="terms" className="text-sm font-medium leading-relaxed text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t("signup.termsStart")} {" "}
                  <a href="#" className="text-primary hover:underline font-semibold">{t("signup.terms")}</a>
                  {" "}{t("signup.and")} {" "}
                  <a href="#" className="text-primary hover:underline font-semibold">{t("signup.privacy")}</a>.
                </Label>
              </div>
            </div>

            <Button type="submit" size="xl" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? t("signup.loading") : t("signup.submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
