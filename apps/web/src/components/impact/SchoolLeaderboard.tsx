import type { LeaderboardEntry } from "@/data/mockImpact";

export function SchoolLeaderboard({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return (
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
  );
}