import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ImpactKPIs } from "@/components/impact/ImpactKPIs";
import { ImpactChart } from "@/components/impact/ImpactChart";
import { SecurityNotice } from "@/components/impact/SecurityNotice";
import { SchoolLeaderboard } from "@/components/impact/SchoolLeaderboard";
import { useImpactData } from "@/hooks/useImpactData";

export default function ImpactPage() {
  const { chartData, leaderboard, kpis, isLoading, error } = useImpactData();

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

        {error && (
          <div className="text-center py-10 text-destructive font-medium bg-destructive/10 rounded-2xl">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-muted-foreground font-medium">
            Chargement des données d'impact...
          </div>
        ) : (
          <>
            <ImpactKPIs kpis={kpis} />

            {/* Chart & Sidebar Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
              <ImpactChart data={chartData} />

              {/* Right Column: Leaderboard & Info */}
              <div className="w-full lg:w-[380px] shrink-0 space-y-6">
                <SecurityNotice />
                <SchoolLeaderboard leaderboard={leaderboard} />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}