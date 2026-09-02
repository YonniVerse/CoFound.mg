import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { ArrowLeft, ArrowRight, FileSpreadsheet, UploadCloud, FileText, XCircle, Loader2 } from 'lucide-react'
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
      setError('Le fichier est trop volumineux (max 10 Mo).')
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
        setError(caught.messageKey && caught.messageKey !== 'errors.internal' ? caught.messageKey : (caught.message || 'Une erreur serveur est survenue lors de l’envoi.'))
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
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Étape 1 sur 4</span>
          </div>

          <header className="max-w-2xl space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <FileSpreadsheet className="h-7 w-7" />
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Nouvel import</p>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Sélectionnez le fichier d’étudiants</h1>
            <p className="text-base leading-7 text-muted-foreground">
              Déposez votre liste au format CSV ou Excel (XLSX). Nous analyserons la structure avant d’inviter les étudiants.
            </p>
          </header>

          <Card className="rounded-xl border-border bg-card shadow-2xs">
            <CardHeader>
              <CardTitle>Déposer un fichier</CardTitle>
              <p className="text-sm text-muted-foreground">Formats acceptés : .csv, .xlsx, .xls (max 10 Mo)</p>
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
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} Ko</p>
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
