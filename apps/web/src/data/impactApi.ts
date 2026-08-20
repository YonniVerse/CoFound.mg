import { fetchMock } from "./api";
import { MOCK_CHART_DATA, MOCK_LEADERBOARD, MOCK_KPIS } from "./mockImpact";

export async function getImpactData() {
  return fetchMock({
    success: true,
    data: {
      chartData: MOCK_CHART_DATA,
      leaderboard: MOCK_LEADERBOARD,
      kpis: MOCK_KPIS
    },
    message: "Impact data retrieved successfully",
    meta: {}
  });
}