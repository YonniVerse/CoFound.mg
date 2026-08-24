import { useState } from "react";
import { useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { exportProjectArchive } from "@/data/projectApi";

export default function ProjectExportPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const download = async () => {
    setBusy(true); setMessage("");
    try {
      const archive = await exportProjectArchive(id);
      const blob = new Blob([JSON.stringify(archive, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = "project-archive.json"; link.click(); URL.revokeObjectURL(url);
      setMessage("L’archive du projet a été téléchargée.");
    } catch { setMessage("L’export est réservé au propriétaire du projet."); }
    finally { setBusy(false); }
  };
  return <DashboardLayout><main className="mx-auto max-w-2xl px-6 py-8"><div className="rounded-2xl border bg-card p-6"><h1 className="text-3xl font-bold">Exporter le projet</h1><p className="mt-3 text-muted-foreground">L’archive JSON contient les données projet et conserve les membres sous forme pseudonymisée.</p><button type="button" className="mt-6 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-50" onClick={() => void download()} disabled={busy || !id}>{busy ? "Préparation…" : "Télécharger l’archive"}</button>{message && <p role="status" className="mt-4 text-sm text-muted-foreground">{message}</p>}</div></main></DashboardLayout>;
}
