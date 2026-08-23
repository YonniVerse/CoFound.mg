import { useState } from "react";
import { Send, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n";

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
  const { t } = useI18n()
  const [selectedPositionId, setSelectedPositionId] = useState<string>("none");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError(t('application.messageTooShort'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        projectId,
        positionId: selectedPositionId === "none" ? undefined : selectedPositionId,
        message: message.trim(),
      });
      setMessage("");
      setSelectedPositionId("none");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('application.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-lg relative space-y-5 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground">
            {t('application.title')}
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
              <label className="text-xs font-semibold text-foreground">
                {t('application.positionOptional')}
              </label>
              <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                <SelectTrigger className="h-11 w-full rounded-xl border border-border/80 bg-card px-4 text-sm font-medium shadow-2xs transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20">
                  <SelectValue placeholder={t('import.spontaneousApplication')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('import.spontaneousApplication')}</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos.id} value={pos.id}>
                      {pos.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Motivation Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              {t('application.motivationLabel')}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('application.motivationPlaceholder')}
              className="min-h-[120px] rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-medium leading-relaxed shadow-2xs transition-[border-color,box-shadow] placeholder:text-muted-foreground/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              rows={4}
            />
            <p className="text-[11px] text-muted-foreground/70 font-mono text-right">
              {message.length}/2000 {t('application.characterCount')}
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors cursor-pointer sm:text-sm"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || message.trim().length < 10}
              className="h-9 gap-1.5 rounded-lg px-3.5 text-xs font-medium shadow-none transition-colors cursor-pointer sm:text-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? t('application.submitting') : t('application.submit')}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
