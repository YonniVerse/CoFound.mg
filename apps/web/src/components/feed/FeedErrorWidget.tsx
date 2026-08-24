import { AlertCircle, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedErrorWidgetProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function FeedErrorWidget({
  title = "Impossible de charger les profils de talents",
  message = "Nous n'avons pas pu récupérer la liste des talents. Cela peut être dû à un problème réseau temporaire ou à une maintenance du serveur.",
  onRetry,
}: FeedErrorWidgetProps) {
  return (
    <div className="bg-card border border-destructive/20 rounded-2xl p-8 sm:p-10 shadow-2xs text-center flex flex-col items-center justify-center my-4 animate-in fade-in zoom-in-95 duration-200">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-4 shadow-2xs">
        <AlertCircle className="h-7 w-7" />
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-lg text-foreground mb-1.5 flex items-center gap-2">
        <span>{title}</span>
      </h3>

      {/* Detailed Message */}
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
        {message}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="h-9 px-5 text-xs font-semibold rounded-xl border-border hover:bg-accent hover:text-foreground gap-2 cursor-pointer transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Réessayer la connexion</span>
          </Button>
        )}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 font-mono">
          <ShieldAlert className="h-3 w-3" />
          <span>Code d'erreur : FEED_FETCH_FAILED</span>
        </div>
      </div>
    </div>
  );
}
