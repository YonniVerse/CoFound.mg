import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { ArrowLeft, ArrowRight, FileSpreadsheet, UploadCloud, FileText, XCircle, Loader2, Download, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, ApiClientError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

type UploadResponse = {
  batchId: string
  fileName: string
  status: string
  totalRows: number
  errorRows: number
}

const SAMPLE_CSV_CONTENT = `Adresse e-mail,Prénom,Nom,Filière,Niveau,Année d'entrée,Genre,Matricule
mialy.randria@example.mg,Mialy,Randriambelo,Informatique,L3,2024,F,ETU-2024-001
normanvonizara@gmail.com,Norman,Vonizara,Informatique,M1,2024,F,ETU-2024-002
hery.andria@example.mg,Hery,Andrianina,Génie Civil,L2,2023,M,ETU-2023-015
toky.ramah@example.mg,Toky,Ramaharo,Informatique,M2,2022,M,ETU-2022-089
soafara.rasoa@example.mg,Soafara,Rasoanaivo,Économie,L3,2024,F,ETU-2024-044`

export default function ImportUploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateAndSetFile(file: File) {
    setError(null)
    const ext = file.name.toLowerCase().split('.').pop()
    if (!['csv', 'xlsx', 'xls'].includes(ext ?? '')) {
      setError('Format de fichier non pris en charge. Veuillez sélectionner un fichier .csv, .xlsx ou .xls.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (taille maximale autorisée : 10 Mo).')
      return
    }
    if (file.size === 0) {
      setError('Le fichier sélectionné est vide.')
      return
    }
    setSelectedFile(file)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) validateAndSetFile(file)
  }

  function handleDownloadSample() {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'modele_import_etudiants.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function handleUpload() {
    if (!selectedFile || isUploading) return
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await apiClient.request<UploadResponse>('/institution/imports/upload', {
        method: 'POST',
        body: formData,
      })

      navigate(`/institution/imports/${response.batchId}/mapping?importId=${response.batchId}`)
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setError(
          caught.messageKey && caught.messageKey !== 'errors.internal'
            ? caught.messageKey
            : caught.message || 'Une erreur serveur est survenue lors de l’envoi.',
        )
      } else if (caught instanceof Error) {
        setError(caught.message)
      } else {
        setError('Une erreur est survenue lors de l’envoi du fichier. Vérifiez votre connexion et le format du fichier.')
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" onClick={() => navigate('/institution')} className="-ml-3 gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour à la console
            </Button>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Étape 1 sur 4
            </span>
          </div>

          <header className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <FileSpreadsheet className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Nouvel import</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sélectionnez le fichier d’étudiants
            </h1>
            <p className="text-base leading-7 text-muted-foreground">
              Déposez votre liste d'étudiants au format CSV ou Excel (XLSX). La structure sera analysée et prévisualisée avant toute création de compte.
            </p>
          </header>

          <Card className="rounded-xl border-border bg-card shadow-2xs">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Déposer un fichier</CardTitle>
                <p className="text-sm text-muted-foreground">Formats acceptés : CSV (.csv), Excel (.xlsx, .xls) · Max 10 Mo</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadSample} className="h-8 gap-2 text-xs">
                <Download className="h-3.5 w-3.5" /> Télécharger un modèle CSV
              </Button>
            </CardHeader>
            <CardContent className="mt-3 space-y-6">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-border/80 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} Ko · Prêt pour l'analyse
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                      }}
                      className="mt-2 text-xs"
                    >
                      Changer de fichier
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Glissez-déposez votre fichier ici</p>
                      <p className="mt-1 text-xs text-muted-foreground">ou cliquez pour parcourir vos dossiers</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <XCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Format specifications */}
              <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <HelpCircle className="h-4 w-4 text-primary" /> Structure attendue des colonnes
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Colonnes obligatoires :</span>
                    <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
                      <li><strong>Adresse e-mail</strong> (clé unique de compte)</li>
                      <li><strong>Prénom</strong> et <strong>Nom</strong></li>
                      <li><strong>Filière</strong> (ex: Informatique, Gestion)</li>
                      <li><strong>Niveau</strong> (ex: L3, M1, M2)</li>
                      <li><strong>Année d'entrée</strong> (ex: 2024)</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">Colonnes facultatives :</span>
                    <ul className="space-y-0.5 text-muted-foreground list-disc list-inside">
                      <li><strong>Genre</strong> (privé, statistiques agrégées uniquement)</li>
                      <li><strong>Matricule</strong> (identifiant étudiant interne)</li>
                      <li>Encodages supportés : UTF-8, Windows-1252, accents</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  disabled={!selectedFile || isUploading}
                  onClick={() => void handleUpload()}
                  className="gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Analyse du fichier…
                    </>
                  ) : (
                    <>
                      Continuer vers le mapping <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  )
}
