import { useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PositionOption {
  id: string;
  title: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  projectId: string;
  positions?: PositionOption[];
  onSubmit: (data: { projectId: string; positionId?: string; message: string }) => Promise<void>;
}

export function ApplyModal({
  isOpen,
  onClose,
  projectTitle,
  projectId,
  positions = [],
  onSubmit,
}: ApplyModalProps) {
  const [selectedPositionId, setSelectedPositionId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError("Votre message doit contenir au moins 10 caractères.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        projectId,
        positionId: selectedPositionId || undefined,
        message: message.trim(),
      });
      setMessage("");
      setSelectedPositionId("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-lg relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground">
            Candidater au projet
          </h2>
          <p className="text-xs sm:text-sm text-primary font-medium mt-0.5">
            {projectTitle}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Position Selector (optional) */}
          {positions.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Poste recherché (optionnel)
              </label>
              <select
                value={selectedPositionId}
                onChange={(e) => setSelectedPositionId(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                <option value="">Candidature spontanée (aucun poste spécifique)</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Motivation Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Message de motivation
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Présentez brièvement vos compétences, votre expérience et la valeur ajoutée que vous souhaitez apporter à ce projet..."
              className="min-h-[120px] text-xs sm:text-sm rounded-xl border-border bg-background focus-visible:ring-1 focus-visible:ring-primary leading-relaxed"
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground/70 font-mono text-right">
              {message.length}/2000 caractères (min 10)
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || message.trim().length < 10}
              className="h-9 px-5 text-xs font-semibold rounded-xl gap-2 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Envoi..." : "Envoyer ma candidature"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
