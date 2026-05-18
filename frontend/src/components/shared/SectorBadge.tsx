import { cn } from "@/lib/utils";

interface SectorBadgeProps {
  sector: string;
  className?: string;
}

const sectorEmojis: Record<string, string> = {
  AgriTech: "🌾",
  HealthTech: "🏥",
  EdTech: "📚",
  FinTech: "💰",
  "E-commerce": "🛒",
  Social: "🌍",
};

export function SectorBadge({ sector, className }: SectorBadgeProps) {
  const emoji = sectorEmojis[sector] || "🚀";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary-light text-green-700 px-3 py-1 text-xs font-medium",
        className
      )}
    >
      {emoji} {sector}
    </span>
  );
}
