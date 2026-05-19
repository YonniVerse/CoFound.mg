import { cn } from "@/lib/utils";
import { 
  Sprout, 
  HeartPulse, 
  GraduationCap, 
  Coins, 
  ShoppingCart, 
  Globe, 
  Rocket, 
  type LucideIcon 
} from "lucide-react";

interface SectorBadgeProps {
  sector: string;
  className?: string;
}

const sectorIcons: Record<string, LucideIcon> = {
  AgriTech: Sprout,
  HealthTech: HeartPulse,
  EdTech: GraduationCap,
  FinTech: Coins,
  "E-commerce": ShoppingCart,
  Social: Globe,
};

export function SectorBadge({ sector, className }: SectorBadgeProps) {
  const Icon = sectorIcons[sector] || Rocket;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted border border-border text-foreground px-3 py-1 text-xs font-semibold tracking-tight",
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
      {sector}
    </span>
  );
}