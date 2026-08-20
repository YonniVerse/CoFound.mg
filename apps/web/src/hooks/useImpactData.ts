import { useState, useEffect } from "react";
import { getImpactData } from "@/data/impactApi";
import type { ChartDataPoint, LeaderboardEntry, ImpactKPIsData } from "@/data/mockImpact";

interface ImpactDataState {
  chartData: ChartDataPoint[];
  leaderboard: LeaderboardEntry[];
  kpis: ImpactKPIsData | null;
}

export function useImpactData() {
  const [data, setData] = useState<ImpactDataState>({
    chartData: [],
    leaderboard: [],
    kpis: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await getImpactData();
        if (response.success) {
          setData(response.data);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des données d'impact.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return { ...data, isLoading, error };
}