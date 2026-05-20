import { ShieldCheck } from "lucide-react";

export function SecurityNotice() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xs text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldCheck className="h-24 w-24" />
      </div>
      <div className="relative z-10 space-y-3">
        <div className="flex items-center gap-2 font-bold text-female-light">
          <ShieldCheck className="h-5 w-5" />
          Espace Sécurisé Actif
        </div>
        <h3 className="font-heading font-bold text-xl leading-tight">Pourquoi demander le genre ?</h3>
        <p className="text-sm font-medium text-slate-300 leading-relaxed">
          Ces données permettent d'activer l'Espace Sécurisé pour nos utilisatrices. Si une étudiante l'active, son profil est masqué des recherches publiques masculines et priorisé pour les équipes mixtes. L'objectif : créer un environnement de confiance.
        </p>
      </div>
    </div>
  );
}