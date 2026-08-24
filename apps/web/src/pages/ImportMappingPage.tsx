import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet, Info, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { importColumnMappingSchema, type ImportField } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useI18n } from '@/i18n'

const FIELD_LABELS: Record<ImportField, string> = {
  email: 'Email',
  firstName: 'Prénom',
  lastName: 'Nom',
  fieldOfStudy: 'Filière',
  level: 'Niveau',
  entryYear: "Année d'entrée",
  gender: 'Genre (facultatif)',
  studentNumber: 'Matricule (facultatif)',
}

const REQUIRED_FIELDS: ImportField[] = ['email', 'firstName', 'lastName', 'fieldOfStudy', 'level', 'entryYear']

type DetectedColumn = {
  name: string
  suggestedField: ImportField | null
  samples: string[]
}

const DETECTED_COLUMNS: DetectedColumn[] = [
  { name: 'Adresse e-mail', suggestedField: 'email', samples: ['mialy.randria@example.mg', 'fara.rakoto@example.mg', 'hery.andria@example.mg'] },
  { name: 'Prénom', suggestedField: 'firstName', samples: ['Mialy', 'Fara', 'Hery'] },
  { name: 'Nom de famille', suggestedField: 'lastName', samples: ['Randria', 'Rakoto', 'Andria'] },
  { name: 'Filière', suggestedField: 'fieldOfStudy', samples: ['Informatique', 'Gestion', 'Génie civil'] },
  { name: 'Niveau', suggestedField: 'level', samples: ['L3', 'M1', 'L2'] },
  { name: "Année d'entrée", suggestedField: 'entryYear', samples: ['2024', '2024', '2023'] },
  { name: 'Note interne', suggestedField: null, samples: ['groupe A', 'à rappeler', 'bourse'] },
]

const initialMapping = Object.fromEntries(
  DETECTED_COLUMNS.map((column) => [column.name, column.suggestedField]),
) as Record<string, ImportField | null>

export default function ImportMappingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const importId = searchParams.get('importId')
  const [mapping, setMapping] = useState(initialMapping)
  const [submitted, setSubmitted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const mappedFields = useMemo(() => new Set(Object.values(mapping).filter((field): field is ImportField => field !== null)), [mapping])
  const missingFields = REQUIRED_FIELDS.filter((field) => !mappedFields.has(field))
  const duplicateFields = useMemo(() => {
    const counts = new Map<ImportField, number>()
    Object.values(mapping).forEach((field) => {
      if (field) counts.set(field, (counts.get(field) ?? 0) + 1)
    })
    return [...counts.entries()].filter(([, count]) => count > 1).map(([field]) => field)
  }, [mapping])
  const hasErrors = missingFields.length > 0 || duplicateFields.length > 0

  function updateMapping(column: string, value: string) {
    setSubmitted(false)
    setSaveError(null)
    setMapping((current) => ({ ...current, [column]: value === '__ignore__' ? null : value as ImportField }))
  }

  async function continueToPreview() {
    if (hasErrors || isSaving) return
    setSaveError(null)
    setIsSaving(true)
    try {
      const payload = importColumnMappingSchema.parse({ columns: mapping })
      if (importId) await apiClient.patch(`/institution/imports/${importId}`, payload)
      setSubmitted(true)
      navigate(importId ? `/institution/imports/${importId}/preview` : '/institution/imports/preview')
    } catch {
      setSaveError('Le mapping n’a pas pu être enregistré. Vérifiez votre connexion puis réessayez.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate('/institution')} className="-ml-3 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour à la console
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Étape 2 sur 4</span>
          </div>

          <header className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <FileSpreadsheet className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Nouvel import</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Vérifiez les colonnes de votre fichier</h1>
            <p className="text-base leading-7 text-muted-foreground">Nous avons proposé une correspondance à partir de votre fichier. Vérifiez-la avant de continuer. Vous pouvez ignorer les colonnes qui ne servent pas à l’import.</p>
          </header>

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>{t('import.privacyNotice')}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('import.mappingTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">Trois exemples issus du fichier sont affichés sous chaque colonne pour vous aider à confirmer la proposition.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {DETECTED_COLUMNS.map((column) => {
                const selectedField = mapping[column.name] ?? null
                const isDuplicate = selectedField !== null && duplicateFields.includes(selectedField)
                return (
                  <div key={column.name} className={`grid gap-4 rounded-xl border p-4 lg:grid-cols-[minmax(180px,1fr)_minmax(220px,1fr)_minmax(220px,1.4fr)] ${isDuplicate ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-background'}`}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{column.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Colonne détectée</p>
                    </div>
                    <div>
                      <label htmlFor={`mapping-${column.name}`} className="mb-2 block text-xs font-semibold text-muted-foreground">Correspond à</label>
                      <Select value={selectedField ?? '__ignore__'} onValueChange={(value) => updateMapping(column.name, value)}>
                        <SelectTrigger id={`mapping-${column.name}`} className="w-full bg-background">
                          <SelectValue placeholder="Choisir un champ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__ignore__">{t('import.ignoreColumn')}</SelectItem>
                          {(Object.keys(FIELD_LABELS) as ImportField[]).map((field) => (
                            <SelectItem key={field} value={field}>{FIELD_LABELS[field]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isDuplicate && <p className="mt-2 text-xs text-destructive">Ce champ est déjà associé à une autre colonne.</p>}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold text-muted-foreground">Exemples</p>
                      <div className="space-y-1 text-sm text-foreground">
                        {column.samples.map((sample, index) => <p key={`${column.name}-${index}`} className="truncate rounded bg-muted/60 px-2 py-1">{sample}</p>)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className={hasErrors ? 'border-amber-500/40' : 'border-emerald-500/40'}>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                {hasErrors ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
                <div>
                  <p className="font-semibold text-foreground">{hasErrors ? 'Le mapping doit être complété' : 'Le mapping est prêt'}</p>
                  {missingFields.length > 0 && <p className="mt-1 text-sm text-muted-foreground">Champs obligatoires manquants : {missingFields.map((field) => FIELD_LABELS[field]).join(', ')}.</p>}
                  {duplicateFields.length > 0 && <p className="mt-1 text-sm text-muted-foreground">Un même champ ne peut correspondre qu’à une seule colonne.</p>}
                  {!hasErrors && <p className="mt-1 text-sm text-muted-foreground">Vous pourrez encore revenir à cette étape avant l’application du lot.</p>}
                  {submitted && <p className="mt-2 text-sm font-semibold text-emerald-700">Mapping enregistré pour la prévisualisation.</p>}
                  {saveError && <p className="mt-2 text-sm font-semibold text-destructive">{saveError}</p>}
                </div>
              </div>
              <Button disabled={hasErrors || isSaving} onClick={() => void continueToPreview()} className="gap-2 sm:shrink-0">
                {isSaving ? 'Enregistrement…' : 'Continuer vers la prévisualisation'} <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
