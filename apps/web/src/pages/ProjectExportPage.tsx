import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, FileJson, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { exportProjectArchive } from "@/data/projectApi";

export default function ProjectExportPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const download = async () => {
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const archive = await exportProjectArchive(id);
      const blob = new Blob([JSON.stringify(archive, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${id}-archive.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("L’archive du projet a été téléchargée avec succès.");
    } catch {
      setError("L’export est réservé au propriétaire du projet.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Link
                to={`/projects/${id}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour au projet
              </Link>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Exporter le projet
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Téléchargez l'intégralité des données de votre projet sous format structuré et interopérable.
              </p>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Export Card */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <FileJson className="h-6 w-6" />
              </div>
              <div className="space-y-1 min-w-0">
                <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                  Archive complète au format JSON
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Ce fichier contient le titre, la présentation, l'ensemble des 9 blocs du Business Model Canvas, les tâches, les postes ouverts et l'historique des publications.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Garantie de confidentialité et RGPD</span>
              </div>
              <p className="leading-relaxed">
                Les membres et contributeurs restent pseudonymisés dans l'archive exportée afin de préserver leur anonymat conformément aux règles de la plateforme.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button
                type="button"
                onClick={() => void download()}
                disabled={busy || !id}
                className="h-10 gap-2 rounded-lg px-5 text-xs font-semibold sm:text-sm"
              >
                <Download className="h-4 w-4" />
                {busy ? "Préparation de l’archive…" : "Télécharger l’archive JSON"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}
