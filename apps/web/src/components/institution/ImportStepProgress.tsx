import { Check, UploadCloud, FileSpreadsheet, Eye, Send } from 'lucide-react'

export type ImportStep = 'upload' | 'mapping' | 'preview' | 'applied'

interface ImportStepProgressProps {
  currentStep: ImportStep
}

const STEPS = [
  { id: 'upload', label: '1. Fichier', icon: UploadCloud },
  { id: 'mapping', label: '2. Correspondance', icon: FileSpreadsheet },
  { id: 'preview', label: '3. Vérification', icon: Eye },
  { id: 'applied', label: '4. Application', icon: Send },
] as const

export function ImportStepProgress({ currentStep }: ImportStepProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Progression de l’import" className="w-full">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const StepIcon = step.icon

          return (
            <li
              key={step.id}
              className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? 'border-primary bg-primary/5 text-primary shadow-2xs font-bold'
                  : isCompleted
                  ? 'border-border/80 bg-muted/40 text-foreground'
                  : 'border-border/40 bg-background text-muted-foreground opacity-60'
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
              </div>
              <span className="truncate">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
