import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet, Info, Loader2, XCircle } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { importColumnMappingSchema, importMappingResponseSchema, type ImportDetectedColumn, type ImportField, type ImportMappingResponse } from '@cofound/shared'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useI18n } from '@/i18n'

const FIELD_LABELS: Record<ImportField, string> = {
  email: 'Email (obligatoire)',
  firstName: 'Prénom (obligatoire)',
  lastName: 'Nom (obligatoire)',
  fieldOfStudy: 'Filière (obligatoire)',
  level: 'Niveau (obligatoire)',
  entryYear: "Année d'entrée (obligatoire)",
  gender: 'Genre (facultatif)',
  studentNumber: 'Matricule (facultatif)',
}

const REQUIRED_FIELDS: ImportField[] = ['email', 'firstName', 'lastName', 'fieldOfStudy', 'level', 'entryYear']

const DEFAULT_COLUMNS: ImportDetectedColumn[] = [
  { name: 'Adresse e-mail', suggestedField: 'email', samples: ['mialy.randria@example.mg', 'fara.rakoto@example.mg', 'hery.andria@example.mg'] },
  { name: 'Prénom', suggestedField: 'firstName', samples: ['Mialy', 'Fara', 'Hery'] },
  { name: 'Nom', suggestedField: 'lastName', samples: ['Randriambelo', 'Rakotondrabe', 'Andrianina'] },
  { name: 'Filière', suggestedField: 'fieldOfStudy', samples: ['Informatique', 'Gestion', 'Génie civil'] },
  { name: 'Niveau', suggestedField: 'level', samples: ['L3', 'M1', 'L2'] },
  { name: "Année d'entrée", suggestedField: 'entryYear', samples: ['2024', '2024', '2023'] },
  { name: 'Genre', suggestedField: 'gender', samples: ['F', 'M', 'F'] },
  { name: 'Matricule', suggestedField: 'studentNumber', samples: ['ETU-001', 'ETU-002', 'ETU-015'] },
]

export default function ImportMappingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const importId = params.id || searchParams.get('importId')

  const [columns, setColumns] = useState<ImportDetectedColumn[]>(DEFAULT_COLUMNS)
  const [mapping, setMapping] = useState<Record<string, ImportField | null>>(() => {
    return Object.fromEntries(DEFAULT_COLUMNS.map((col) => [col.name, col.suggestedField]))
  })
  const [fileName, setFileName] = useState<string>('import.csv')
  const [isLoading, setIsLoading] = useState(Boolean(importId))
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!importId) return

    let cancelled = false

    apiClient
      .get<ImportMappingResponse>(`/institution/imports/${importId}/mapping`, importMappingResponseSchema)
      .then((data) => {
        if (cancelled) return
        setFileName(data.fileName)
        if (data.detectedColumns && data.detectedColumns.length > 0) {
          setColumns(data.detectedColumns)
          const initial = Object.fromEntries(
            data.detectedColumns.map((col) => [col.name, col.suggestedField]),
          )
          setMapping(initial)
        } else {
          setColumns(DEFAULT_COLUMNS)
        }
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiClientError) {
          setLoadError(err.message || 'Impossible de charger la structure du fichier.')
        } else {
          setLoadError('Impossible de charger la structure du fichier. Vérifiez votre connexion.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [importId])

  const mappedFields = useMemo(
    () => new Set(Object.values(mapping).filter((field): field is ImportField => field !== null)),
    [mapping],
  )
  const missingFields = REQUIRED_FIELDS.filter((field) => !mappedFields.has(field))
  const duplicateFields = useMemo(() => {
    const counts = new Map<ImportField, number>()
    Object.values(mapping).forEach((field) => {
      if (field) counts.set(field, (counts.get(field) ?? 0) + 1)
    })
    return [...counts.entries()].filter(([, count]) => count > 1).map(([field]) => field)
  }, [mapping])

  const hasErrors = missingFields.length > 0 || duplicateFields.length > 0

  function updateMapping(columnName: string, value: string) {
    setSaveError(null)
    setMapping((current) => ({
      ...current,
      [columnName]: value === '__ignore__' ? null : (value as ImportField),
    }))
  }

  async function continueToPreview() {
    if (hasErrors || isSaving) return
    setSaveError(null)
    setIsSaving(true)

    try {
      const payload = importColumnMappingSchema.parse({ columns: mapping })
      if (importId) {
        await apiClient.patch(`/institution/imports/${importId}`, payload)
      }
      navigate(importId ? `/institution/imports/${importId}/preview` : '/institution/imports/preview')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setSaveError(err.message || 'Le mapping n’a pas pu être enregistré.')
      } else {
        setSaveError('Le mapping n’a pas pu être enregistré. Vérifiez votre connexion puis réessayez.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate('/institution/imports/new')} className="-ml-3 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour à l'envoi
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Étape 2 sur 4</span>
          </div>

          <header className="max-w-3xl space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <FileSpreadsheet className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Nouvel import · {fileName}</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Vérifiez les colonnes de votre fichier
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Nous avons analysé les en-têtes et proposé une correspondance automatique. Confirmez ou ajustez l’association de chaque colonne avant de prévisualiser les étudiants.
            </p>
          </header>

          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>{t('import.privacyNotice')}</p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="space-y-4 p-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ) : loadError ? (
            <Card className="border-destructive/30">
              <CardContent className="flex items-center gap-3 p-6 text-destructive">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>{loadError}</span>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl border-border bg-card shadow-2xs">
              <CardHeader>
                <CardTitle>{t('import.mappingTitle')}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Des exemples issus du fichier sont affichés pour chaque colonne. Vous pouvez ignorer les colonnes non pertinentes.
                </p>
              </CardHeader>
              <CardContent className="mt-3 space-y-4">
                {columns.map((column) => {
                  const selectedField = mapping[column.name] ?? null
                  const isDuplicate = selectedField !== null && duplicateFields.includes(selectedField)
                  return (
                    <div
                      key={column.name}
                      className={`grid gap-4 rounded-xl border p-4 lg:grid-cols-[minmax(180px,1fr)_minmax(240px,1.2fr)_minmax(220px,1.4fr)] ${
                        isDuplicate ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-background'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{column.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">Colonne détectée</p>
                      </div>
                      <div>
                        <label
                          htmlFor={`mapping-${column.name}`}
                          className="mb-2 block text-xs font-semibold text-muted-foreground"
                        >
                          Correspond au champ
                        </label>
                        <Select
                          value={selectedField ?? '__ignore__'}
                          onValueChange={(value) => updateMapping(column.name, value)}
                        >
                          <SelectTrigger id={`mapping-${column.name}`} className="w-full bg-background">
                            <SelectValue placeholder="Choisir un champ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__ignore__">{t('import.ignoreColumn')}</SelectItem>
                            {(Object.keys(FIELD_LABELS) as ImportField[]).map((field) => (
                              <SelectItem key={field} value={field}>
                                {FIELD_LABELS[field]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isDuplicate && (
                          <p className="mt-2 text-xs text-destructive">Ce champ est déjà associé à une autre colonne.</p>
                        )}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">Aperçu des données</p>
                        <div className="space-y-1 text-sm text-foreground">
                          {column.samples.length > 0 ? (
                            column.samples.map((sample, index) => (
                              <p key={`${column.name}-${index}`} className="truncate rounded bg-muted/60 px-2 py-1">
                                {sample}
                              </p>
                            ))
                          ) : (
                            <p className="rounded bg-muted/40 px-2 py-1 text-xs italic text-muted-foreground">
                              Aucun exemple
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <Card className={hasErrors ? 'border-amber-500/40 bg-amber-500/[0.02]' : 'border-emerald-500/40 bg-emerald-500/[0.02]'}>
            <CardContent className="mt-3 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                {hasErrors ? (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {hasErrors ? 'Le mapping doit être complété' : 'Le mapping est valide et prêt'}
                  </p>
                  {missingFields.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Champs obligatoires manquants :{' '}
                      <span className="font-medium text-foreground">
                        {missingFields.map((field) => FIELD_LABELS[field]).join(', ')}
                      </span>
                      .
                    </p>
                  )}
                  {duplicateFields.length > 0 && (
                    <p className="mt-1 text-sm text-destructive">
                      Un même champ ne peut correspondre qu’à une seule colonne :{' '}
                      {duplicateFields.map((f) => FIELD_LABELS[f]).join(', ')}.
                    </p>
                  )}
                  {!hasErrors && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Toutes les colonnes requises sont correctement associées.
                    </p>
                  )}
                  {saveError && <p className="mt-2 text-sm font-semibold text-destructive">{saveError}</p>}
                </div>
              </div>
              <Button
                disabled={hasErrors || isSaving || isLoading}
                onClick={() => void continueToPreview()}
                className="gap-2 sm:shrink-0"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
                  </>
                ) : (
                  <>
                    Continuer vers la prévisualisation <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
