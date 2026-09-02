import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  XCircle,
  Download,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'
import { ImportStepProgress } from '@/components/institution/ImportStepProgress'

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
      setError('Format non pris en charge. Veuillez sélectionner un fichier .csv, .xlsx ou .xls.')
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
    } catch {
      setError('Une erreur est survenue lors de l’envoi du fichier. Veuillez réessayer.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6">
          <InstitutionHeader
            title="Importer une promotion"
            description="Importez la liste de vos étudiants pour créer leurs affiliations et leur permettre de valoriser leurs compétences sur CoFound."
            backHref="/institution/imports"
            backLabel="Historique des imports"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="h-9 gap-1.5 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger modèle CSV
              </Button>
            }
          />

          <ImportStepProgress currentStep="upload" />

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <XCircle className="h-4 w-4 shrink-0" />
              <p className="flex-1 font-medium">{error}</p>
            </div>
          )}

          {/* Upload Dropzone Card */}
          <Card className="border-border/80 shadow-2xs">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="font-heading text-lg font-bold text-foreground">
                Sélectionnez votre fichier d'étudiants
              </CardTitle>
              <CardDescription className="text-xs">
                Glissez-déposez votre fichier Excel ou CSV, ou parcourez vos dossiers locaux.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 pt-3 space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
                    isDragging
                      ? 'border-primary bg-primary/[0.04] scale-[0.99]'
                      : 'border-border/80 bg-background hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <UploadCloud className="h-7 w-7" />
                  </div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    Cliquez pour choisir un fichier ou glissez-le ici
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formats acceptés : <strong>.CSV</strong>, <strong>.XLSX</strong>, <strong>.XLS</strong> (taille max. 10 Mo)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-primary/20 bg-primary/[0.02] p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FileSpreadsheet className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} Ko • Fichier prêt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Changer de fichier
                    </Button>
                    <Button
                      onClick={() => void handleUpload()}
                      disabled={isUploading}
                      className="gap-2 text-xs font-semibold"
                    >
                      {isUploading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                      Continuer vers la correspondance
                    </Button>
                  </div>
                </div>
              )}

              {/* Guidelines & Advice */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    Colonnes obligatoires
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong className="text-foreground">Email :</strong> adresse institutionnelle ou personnelle.</li>
                    <li><strong className="text-foreground">Prénom & Nom :</strong> identité de l'étudiant.</li>
                    <li><strong className="text-foreground">Filière / Domaine :</strong> code ou libellé de formation.</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Colonnes facultatives
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong className="text-foreground">Année de promotion :</strong> ex. 2025, 2026.</li>
                    <li><strong className="text-foreground">Matricule / Numéro étudiant :</strong> pour le rapprochement.</li>
                    <li><strong className="text-foreground">Genre :</strong> pour statistiques agrégées (≥ 5).</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy footer banner */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              <strong>Traitement confidentiel :</strong> Les données importées servent uniquement à rattacher les étudiants à votre établissement et à leur envoyer un lien d'activation sécurisé.
            </p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
