import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  UserRound,
  AlertCircle,
} from "lucide-react";
import {
  createProjectTask,
  deleteProjectTask,
  getProjectTasks,
  updateProjectTask,
} from "@/data/projectApi";
import { ApiClientError } from "@/lib/api-client";
import {
  createProjectTaskSchema,
  taskStatusSchema,
  type ProjectTask,
  type TaskStatusInput,
} from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TaskStatus = TaskStatusInput;
const statusLabels: Record<TaskStatus, { label: string; className: string }> = {
  TODO: {
    label: "À faire",
    className: "bg-muted text-muted-foreground border-border",
  },
  DOING: {
    label: "En cours",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  BLOCKED: {
    label: "Bloquée",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  DONE: {
    label: "Terminée",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
};

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
    getProjectTasks(id)
      .then((response) => {
        if (active) {
          setTasks(response.tasks);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger les tâches du projet.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    const input = createProjectTaskSchema.safeParse({
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate || null,
    });
    if (!input.success) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }
    setBusyId("create");
    setError("");
    setNotice("");
    try {
      const created = await createProjectTask(id, input.data);
      setTasks((current) => [...current, created as ProjectTask]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setNotice("Tâche créée avec succès.");
    } catch {
      setError("La tâche n'a pas pu être créée.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(task: ProjectTask, status: TaskStatus) {
    setBusyId(task.id);
    setError("");
    try {
      const updated = await updateProjectTask(id, task.id, { status });
      setTasks((current) =>
        current.map((item) =>
          item.id === task.id
            ? { ...item, ...(updated as ProjectTask), status }
            : item,
        ),
      );
    } catch (caught) {
      setError(
        caught instanceof ApiClientError
          ? "La tâche n'a pas pu être mise à jour."
          : "Une erreur est survenue.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeTask(task: ProjectTask) {
    if (!window.confirm(`Supprimer « ${task.title} » ?`)) return;
    setBusyId(task.id);
    setError("");
    try {
      await deleteProjectTask(id, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice("Tâche supprimée.");
    } catch {
      setError("La tâche n'a pas pu être supprimée.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={id} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
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
                Tâches & Plan de travail
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Suivez l'avancement opérationnel de l'équipe et attribuez les responsabilités.
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Create task card */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Créer une tâche
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Définissez un livrable précis pour faire progresser votre projet.
            </p>

            <form onSubmit={createTask} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="task-title" className="text-xs font-semibold text-foreground">
                    Titre de la tâche
                  </Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex. Finaliser la landing page, contacter 5 clients..."
                    className="h-10 rounded-lg border border-border/80 bg-background text-xs sm:text-sm"
                    required
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="task-desc" className="text-xs font-semibold text-foreground">
                    Description <span className="font-normal text-muted-foreground">(facultatif)</span>
                  </Label>
                  <Input
                    id="task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Détails, critères de réussite ou liens utiles..."
                    className="h-10 rounded-lg border border-border/80 bg-background text-xs sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="task-due" className="text-xs font-semibold text-foreground">
                    Échéance <span className="font-normal text-muted-foreground">(facultatif)</span>
                  </Label>
                  <Input
                    id="task-due"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-10 rounded-lg border border-border/80 bg-background text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={busyId === "create" || !title.trim()}
                  className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  {busyId === "create" ? "Création…" : "Ajouter la tâche"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Tasks List */}
          <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
              <h2 className="font-heading text-base font-bold text-foreground">
                Toutes les tâches ({tasks.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">
                Chargement des tâches…
              </div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">
                Aucune tâche enregistrée. Créez votre première tâche ci-dessus.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {tasks.map((task) => {
                  const currentStatus = statusLabels[task.status] ?? statusLabels.TODO;
                  const isDone = task.status === "DONE";

                  return (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 hover:bg-muted/10 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`font-bold text-sm sm:text-base text-foreground ${
                              isDone ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                        </div>

                        {task.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                          {task.assigneePseudonym ? (
                            <span className="flex items-center gap-1">
                              <UserRound className="h-3 w-3 text-primary" />
                              {task.assigneePseudonym}
                            </span>
                          ) : (
                            <span>Sans responsable</span>
                          )}

                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                        <select
                          disabled={busyId === task.id}
                          value={task.status}
                          aria-label={`Statut de ${task.title}`}
                          onChange={(e) => {
                            const parsed = taskStatusSchema.safeParse(e.target.value);
                            if (parsed.success) void changeStatus(task, parsed.data);
                          }}
                          className={`h-8 rounded-lg border px-2.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${currentStatus.className}`}
                        >
                          {Object.entries(statusLabels).map(([value, info]) => (
                            <option key={value} value={value}>
                              {info.label}
                            </option>
                          ))}
                        </select>

                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyId === task.id}
                          onClick={() => void removeTask(task)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          title="Supprimer la tâche"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </main>
    </DashboardLayout>
  );
}
