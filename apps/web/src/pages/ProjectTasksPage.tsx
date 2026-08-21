import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createProjectTask, deleteProjectTask, getProjectTasks, updateProjectTask } from "@/data/projectApi";
import { ApiClientError } from "@/lib/api-client";
import { createProjectTaskSchema, taskStatusSchema, type ProjectTask, type TaskStatusInput } from "@cofound/shared";

type TaskStatus = TaskStatusInput;
const statusLabels: Record<TaskStatus, string> = { TODO: "À faire", DOING: "En cours", BLOCKED: "Bloquée", DONE: "Terminée" };

export default function ProjectTasksPage() {
  const { id = "" } = useParams();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    getProjectTasks(id).then((response) => { if (active) { setTasks(response.tasks); setLoading(false); } }).catch(() => { if (active) { setError("Impossible de charger les tâches du projet."); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  async function createTask() {
    const input = createProjectTaskSchema.safeParse({ title, description: description || null, dueDate: dueDate || null });
    if (!input.success) { setError("Le titre de la tâche est obligatoire."); return; }
    setBusyId("create"); setError(""); setNotice("");
    try { const created = await createProjectTask(id, input.data); setTasks((current) => [...current, created as ProjectTask]); setTitle(""); setDescription(""); setDueDate(""); setNotice("Tâche créée."); }
    catch { setError("La tâche n'a pas pu être créée."); }
    finally { setBusyId(null); }
  }

  async function changeStatus(task: ProjectTask, status: TaskStatus) {
    setBusyId(task.id); setError("");
    try { const updated = await updateProjectTask(id, task.id, { status }); setTasks((current) => current.map((item) => item.id === task.id ? { ...item, ...(updated as ProjectTask), status } : item)); }
    catch (caught) { setError(caught instanceof ApiClientError ? "La tâche n'a pas pu être mise à jour." : "Une erreur est survenue."); }
    finally { setBusyId(null); }
  }

  async function removeTask(task: ProjectTask) {
    if (!window.confirm(`Supprimer « ${task.title} » ?`)) return;
    setBusyId(task.id); setError("");
    try { await deleteProjectTask(id, task.id); setTasks((current) => current.filter((item) => item.id !== task.id)); setNotice("Tâche supprimée."); }
    catch { setError("La tâche n'a pas pu être supprimée."); }
    finally { setBusyId(null); }
  }

  return <main className="mx-auto max-w-5xl px-6 py-10">
    <header className="mb-8"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Projet {id}</p><h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Les tâches du projet</h1><p className="mt-2 max-w-2xl text-muted-foreground">Organisez le travail de l'équipe, assignez un responsable et rendez l'avancement visible.</p></header>
    {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}
    {notice && <div role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">{notice}</div>}
    <section className="mb-6 rounded-2xl border border-border bg-background p-6 shadow-sm"><h2 className="font-heading text-lg font-bold">Nouvelle tâche</h2><div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Titre de la tâche" aria-label="Titre de la tâche" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (facultative)" aria-label="Description de la tâche" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" /><button disabled={busyId === "create"} onClick={() => void createTask()} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{busyId === "create" ? "Création…" : "Créer"}</button></div><div className="mt-3"><label className="text-sm font-medium text-muted-foreground">Échéance <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Échéance de la tâche" className="ml-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /></label></div></section>
    <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"><div className="border-b border-border bg-muted/30 px-6 py-4"><h2 className="font-heading text-lg font-bold">Plan de travail</h2><p className="text-sm text-muted-foreground">{tasks.length} tâche{tasks.length > 1 ? "s" : ""}</p></div>{loading ? <div className="px-6 py-12 text-center text-sm text-muted-foreground">Chargement des tâches…</div> : tasks.length === 0 ? <div className="px-6 py-12 text-center text-sm text-muted-foreground">Aucune tâche. Créez le premier élément de travail.</div> : <div className="divide-y divide-border">{tasks.map((task) => <article key={task.id} className="flex flex-wrap items-center gap-4 px-6 py-5"><div className="min-w-56 flex-1"><h3 className="font-bold text-foreground">{task.title}</h3>{task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}<p className="mt-2 text-xs text-muted-foreground">{task.assigneePseudonym ? `Responsable : ${task.assigneePseudonym}` : "Sans responsable"}{task.dueDate ? ` · Échéance : ${new Date(task.dueDate).toLocaleDateString("fr-FR")}` : ""}</p></div><select disabled={busyId === task.id} value={task.status} aria-label={`Statut de ${task.title}`} onChange={(event) => { const parsed = taskStatusSchema.safeParse(event.target.value); if (parsed.success) void changeStatus(task, parsed.data); }} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button disabled={busyId === task.id} onClick={() => void removeTask(task)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50">Supprimer</button></article>)}</div>}</section>
  </main>;
}
