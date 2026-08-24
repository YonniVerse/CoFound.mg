export interface ChartDataPoint {
  month: string;
  femmes: number;
  hommes: number;
}

export interface LeaderboardEntry {
  rank: number;
  school: string;
  femalePercent: number;
  totalUsers: number;
}

export interface ImpactKPIsData {
  parityRate: number;
  monthlyGrowth: number;
  mixedTeams: number;
}

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { month: "Jan", femmes: 40, hommes: 60 },
  { month: "Fév", femmes: 55, hommes: 70 },
  { month: "Mar", femmes: 80, hommes: 95 },
  { month: "Avr", femmes: 130, hommes: 120 },
  { month: "Mai", femmes: 190, hommes: 150 },
  { month: "Juin", femmes: 260, hommes: 180 },
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, school: "ISCAM", femalePercent: 48, totalUsers: 142 },
  { rank: 2, school: "INSCAE", femalePercent: 42, totalUsers: 98 },
  { rank: 3, school: "Faculté de Médecine", femalePercent: 39, totalUsers: 210 },
  { rank: 4, school: "Polytechnique", femalePercent: 24, totalUsers: 340 },
  { rank: 5, school: "MISA", femalePercent: 21, totalUsers: 150 },
];

export const MOCK_KPIS: ImpactKPIsData = {
  parityRate: 38,
  monthlyGrowth: 15,
  mixedTeams: 12
};