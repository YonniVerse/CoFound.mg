import { Trophy, TrendingUp, Users } from "lucide-react";
import type { ImpactKPIsData } from "@/data/mockImpact";

export function ImpactKPIs({ kpis }: { kpis: ImpactKPIsData | null }) {
  const parityRate = kpis?.parityRate ?? 0;
  const monthlyGrowth = kpis?.monthlyGrowth ?? 0;
  const mixedTeams = kpis?.mixedTeams ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-female-light/20 border border-female/30 rounded-2xl p-6 shadow-xs flex flex-col gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-female/10 rounded-full blur-xl -mr-6 -mt-6" />
        <div className="flex items-center gap-2 text-female font-bold mb-2">
          <Users className="h-5 w-5" />
          Taux de Parité Global
        </div>
        <div className="text-4xl font-black text-foreground tracking-tighter">{parityRate}%</div>
        <p className="text-sm font-medium text-muted-foreground">de profils féminins actifs sur la plateforme</p>
      </div>

      <div className="bg-background border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary font-bold mb-2">
          <TrendingUp className="h-5 w-5" />
          Croissance Mensuelle
        </div>
        <div className="text-4xl font-black text-foreground tracking-tighter">+{monthlyGrowth}%</div>
        <p className="text-sm font-medium text-muted-foreground">d'inscriptions féminines ce mois-ci</p>
      </div>

      <div className="bg-background border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
        <div className="flex items-center gap-2 text-secondary font-bold mb-2">
          <Trophy className="h-5 w-5" />
          Équipes Mixtes
        </div>
        <div className="text-4xl font-black text-foreground tracking-tighter">{mixedTeams}</div>
        <p className="text-sm font-medium text-muted-foreground">startups co-fondées par des équipes paritaires ce trimestre</p>
      </div>
    </div>
  );
}