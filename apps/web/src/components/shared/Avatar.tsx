import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-lg",
};

// Distribution stricte et équilibrée selon tes jetons système
function getSemanticThemeColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const designSystemCombos = [
    "bg-primary-light text-primary border border-primary/10",
    "bg-secondary-light text-secondary border border-secondary/10",
    "bg-female-light text-female border border-female/10",
    "bg-muted text-foreground border border-border",
    "bg-accent text-accent-foreground border border-border/50",
  ] as const;
  
  return designSystemCombos[Math.abs(hash) % designSystemCombos.length] ?? designSystemCombos[0];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover border border-border/60", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold select-none tracking-tighter",
        sizeClasses[size],
        getSemanticThemeColor(name),
        className
      )}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}