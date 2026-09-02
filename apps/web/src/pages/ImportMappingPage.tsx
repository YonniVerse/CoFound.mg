import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  FileSpreadsheet,
  XCircle,
  RefreshCw,
  Check,
} from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  importColumnMappingSchema,
  importMappingResponseSchema,
  type ImportDetectedColumn,
  type ImportField,
  type ImportMappingResponse,
} from '@cofound/shared'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { ImportStepProgress } from '@/components/institution/ImportStepProgress'

const FIELD_LABELS: Record<ImportField, { label: string; required: boolean }> = {
  email: { label: 'Adresse e-mail', required: true },
  firstName: { label: 'Prénom', required: true },
  lastName: { label: 'Nom', required: true },
  fieldOfStudy: { label: 'Filière / Domaine', required: true },
  level: { label: 'Niveau d’études', required: true },
  entryYear: { label: 'Année d’entrée', required: true },
  gender: { label: 'Sexe / Genre', required: false },
  dateOfBirth: { label: 'Âge / Date de naissance', required: false },
  studentNumber: { label: 'Matricule / Identifiant', required: false },
}

const REQUIRED_FIELDS: ImportField[] = [
  'email',
  'firstName',
  'lastName',
  'fieldOfStudy',
  'level',
  'entryYear',
]

const DEFAULT_COLUMNS: ImportDetectedColumn[] = [
  {
    name: 'Adresse e-mail',
    suggestedField: 'email',
    samples: ['mialy.randria@example.mg', 'fara.rakoto@example.mg', 'hery.andria@example.mg'],
  },
  { name: 'Prénom', suggestedField: 'firstName', samples: ['Mialy', 'Fara', 'Hery'] },
  { name: 'Nom', suggestedField: 'lastName', samples: ['Randriambelo', 'Rakotondrabe', 'Andrianina'] },
  { name: 'Filière', suggestedField: 'fieldOfStudy', samples: ['Informatique', 'Gestion', 'Génie civil'] },
  { name: 'Niveau', suggestedField: 'level', samples: ['L3', 'M1', 'L2'] },
  { name: "Année d'entrée", suggestedField: 'entryYear', samples: ['2024', '2024', '2023'] },
  { name: 'Sexe / Genre', suggestedField: 'gender', samples: ['F', 'M', 'F'] },
  { name: 'Âge / Date de naissance', suggestedField: 'dateOfBirth', samples: ['21 ans', '15/04/2003', '22'] },
  { name: 'Matricule', suggestedField: 'studentNumber', samples: ['ETU-001', 'ETU-002', 'ETU-015'] },
]

export default function ImportMappingPage() {
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
    } catch {
      setSaveError('Le mapping n’a pas pu être enregistré. Vérifiez votre connexion puis réessayez.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
          <InstitutionHeader
            title="Correspondance des colonnes"
            description={`Vérifiez et confirmez le rôle de chaque colonne détectée dans votre fichier "${fileName}".`}
            backHref="/institution/imports/new"
            backLabel="Retour à l’envoi"
          />

          <ImportStepProgress currentStep="mapping" />

          {saveError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1 font-medium">{saveError}</p>
            </div>
          )}

          {loadError && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1 font-medium">{loadError}</p>
            </div>
          )}

          {/* Required Fields Checklist Bar */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="p-4 sm:p-5 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-sm font-bold text-foreground">
                  Champs obligatoires requis
                </CardTitle>
                <span className="text-xs font-semibold text-muted-foreground">
                  {REQUIRED_FIELDS.length - missingFields.length} / {REQUIRED_FIELDS.length} associés
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2">
              <div className="flex flex-wrap gap-2">
                {REQUIRED_FIELDS.map((field) => {
                  const isMapped = mappedFields.has(field)
                  const isDuplicate = duplicateFields.includes(field)
                  return (
                    <span
                      key={field}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isDuplicate
                          ? 'border-destructive/30 bg-destructive/10 text-destructive'
                          : isMapped
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'border-border bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      {isMapped && !isDuplicate ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                      {FIELD_LABELS[field].label}
                    </span>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Mapping Grid */}
          <Card className="overflow-hidden border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="font-heading text-base font-bold text-foreground">
                    Association des colonnes du fichier
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Associez chaque colonne à un champ système CoFound ou sélectionnez "Ignorer cette colonne".
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-3">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-60" />
                      <Skeleton className="h-10 w-48 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-3.5">Colonne dans votre fichier</th>
                        <th className="px-4 py-3.5">Exemples d’échantillon</th>
                        <th className="px-6 py-3.5 text-right">Champ CoFound associé</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {columns.map((column) => {
                        const selectedField = mapping[column.name] ?? null
                        const isDuplicate =
                          selectedField !== null && duplicateFields.includes(selectedField)
                        const isMatched = selectedField !== null

                        return (
                          <tr
                            key={column.name}
                            className={`transition-colors ${
                              isDuplicate
                                ? 'bg-destructive/[0.04]'
                                : isMatched
                                ? 'hover:bg-muted/30'
                                : 'bg-muted/10 opacity-75'
                            }`}
                          >
                            <td className="px-6 py-4 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-primary/40" />
                                {column.name}
                              </div>
                            </td>

                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              {column.samples && column.samples.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {column.samples.slice(0, 3).map((sample, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground font-mono"
                                    >
                                      {sample}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="italic text-muted-foreground">Aucun échantillon</span>
                              )}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <select
                                value={selectedField ?? '__ignore__'}
                                onChange={(e) => updateMapping(column.name, e.target.value)}
                                className={`h-10 rounded-lg border px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary ${
                                  isDuplicate
                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                    : isMatched
                                    ? 'border-border bg-background text-foreground'
                                    : 'border-border/60 bg-muted/40 text-muted-foreground'
                                }`}
                              >
                                <option value="__ignore__">Ignorer cette colonne</option>
                                <optgroup label="Champs obligatoires">
                                  {REQUIRED_FIELDS.map((field) => (
                                    <option key={field} value={field}>
                                      {FIELD_LABELS[field].label} *
                                    </option>
                                  ))}
                                </optgroup>
                                <optgroup label="Champs facultatifs">
                                  <option value="gender">Sexe / Genre</option>
                                  <option value="dateOfBirth">Âge / Date de naissance</option>
                                  <option value="studentNumber">Matricule / Identifiant</option>
                                </optgroup>
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => navigate('/institution/imports/new')}
              className="text-xs"
            >
              Retour à l'étape précédente
            </Button>

            <Button
              onClick={() => void continueToPreview()}
              disabled={hasErrors || isSaving || isLoading}
              className="gap-2 text-xs font-semibold"
            >
              {isSaving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              Valider et prévisualiser les données
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
