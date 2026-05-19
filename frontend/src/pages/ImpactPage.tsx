import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ShieldCheck, Trophy, TrendingUp, Users } from "lucide-react";

const chartData = [
  { month: "Jan", femmes: 40, hommes: 60 },
  { month: "Fév", femmes: 55, hommes: 70 },
  { month: "Mar", femmes: 80, hommes: 95 },
  { month: "Avr", femmes: 130, hommes: 120 },
  { month: "Mai", femmes: 190, hommes: 150 },
  { month: "Juin", femmes: 260, hommes: 180 },
];

const chartConfig = {
  femmes: {
    label: "Inscriptions Féminines",
    color: "var(--female)",
  },
  hommes: {
    label: "Inscriptions Masculines",
    color: "var(--primary)",
  },
};

const leaderboard = [
  { rank: 1, school: "ISCAM", femalePercent: 48, totalUsers: 142 },
  { rank: 2, school: "INSCAE", femalePercent: 42, totalUsers: 98 },
  { rank: 3, school: "Faculté de Médecine", femalePercent: 39, totalUsers: 210 },
  { rank: 4, school: "Polytechnique", femalePercent: 24, totalUsers: 340 },
  { rank: 5, school: "MISA", femalePercent: 21, totalUsers: 150 },
];

export default function ImpactPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 space-y-10">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-foreground tracking-tight">
            Transparence & Parité
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            Chez CoFound.mg, nous mesurons publiquement notre impact. Ces données en temps réel montrent notre progression vers un écosystème entrepreneurial plus équilibré à Madagascar.
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-female-light/20 border border-female/30 rounded-2xl p-6 shadow-xs flex flex-col gap-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-female/10 rounded-full blur-xl -mr-6 -mt-6" />
            <div className="flex items-center gap-2 text-female font-bold mb-2">
              <Users className="h-5 w-5" />
              Taux de Parité Global
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter">38%</div>
            <p className="text-sm font-medium text-muted-foreground">de profils féminins actifs sur la plateforme</p>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold mb-2">
              <TrendingUp className="h-5 w-5" />
              Croissance Mensuelle
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter">+15%</div>
            <p className="text-sm font-medium text-muted-foreground">d'inscriptions féminines ce mois-ci</p>
          </div>

          <div className="bg-background border border-border rounded-2xl p-6 shadow-xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary font-bold mb-2">
              <Trophy className="h-5 w-5" />
              Équipes Mixtes
            </div>
            <div className="text-4xl font-black text-foreground tracking-tighter">12</div>
            <p className="text-sm font-medium text-muted-foreground">startups co-fondées par des équipes paritaires ce trimestre</p>
          </div>
        </div>

        {/* Chart & Sidebar Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Chart */}
          <div className="flex-1 bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="font-heading font-bold text-xl mb-6">Évolution des inscriptions par genre (2026)</h2>
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillFemmes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-femmes)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-femmes)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="fillHommes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-hommes)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-hommes)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="femmes"
                    stroke="var(--color-femmes)"
                    fill="url(#fillFemmes)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="hommes"
                    stroke="var(--color-hommes)"
                    fill="url(#fillHommes)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          {/* Right Column: Leaderboard & Info */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            
            {/* Security Notice */}
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

            {/* Leaderboard */}
            <div className="bg-background border border-border rounded-2xl p-6 shadow-xs">
              <h3 className="font-heading font-bold text-lg mb-1">Classement par École</h3>
              <p className="text-xs text-muted-foreground font-medium mb-6">Basé sur le pourcentage d'utilisatrices actives.</p>
              
              <div className="space-y-5">
                {leaderboard.map((school, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? "bg-amber-100 text-amber-600" : idx === 1 ? "bg-slate-100 text-slate-600" : idx === 2 ? "bg-orange-50 text-orange-600" : "bg-muted text-muted-foreground"}`}>
                      {school.rank}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-sm font-bold text-foreground">{school.school}</span>
                      <span className="text-xs text-muted-foreground">{school.totalUsers} inscrits</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${school.femalePercent >= 40 ? "text-female" : "text-foreground"}`}>
                        {school.femalePercent}%
                      </span>
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
