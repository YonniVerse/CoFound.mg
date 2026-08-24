import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartDataPoint } from "@/data/mockImpact";

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

export function ImpactChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <div className="flex-1 bg-background border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
      <h2 className="font-heading font-bold text-xl mb-6">Évolution des inscriptions par genre (2026)</h2>
      <div className="h-[350px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
  );
}