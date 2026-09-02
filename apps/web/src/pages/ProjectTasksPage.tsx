import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Plus,
  Trash2,
  UserRound,
  AlertCircle,
  LayoutGrid,
  List,
  CalendarDays,
  Filter,
  Clock,
  AlertTriangle,
  Flame,
  X,
} from "lucide-react";
import {
  createProjectTask,
  deleteProjectTask,
  getProjectTasks,
  updateProjectTask,
  getProjectMembers,
} from "@/data/projectApi";
import {
  createProjectTaskSchema,
  type ProjectTask,
  type TaskStatusInput,
  type TaskPriorityInput,
  type ProjectMemberItem,
} from "@cofound/shared";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TaskStatus = TaskStatusInput;
type TaskPriority = TaskPriorityInput;
type ViewMode = "board" | "list" | "calendar";

const COLUMNS: { id: TaskStatus; label: string; bgClass: string; borderClass: string; badgeClass: string }[] = [
  {
    id: "TODO",
    label: "À faire",
    bgClass: "bg-muted/30",
    borderClass: "border-border/60",
    badgeClass: "bg-muted text-muted-foreground",
  },
  {
    id: "DOING",
    label: "En cours",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/20",
    badgeClass: "bg-primary/10 text-primary border border-primary/20",
  },
  {
    id: "BLOCKED",
    label: "Bloqué",
    bgClass: "bg-destructive/5",
    borderClass: "border-destructive/20",
    badgeClass: "bg-destructive/10 text-destructive border border-destructive/20",
  },
  {
    id: "DONE",
    label: "Terminé",
    bgClass: "bg-emerald-500/5",
    borderClass: "border-emerald-500/20",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
  },
];

const priorityBadges: Record<TaskPriority, { label: string; className: string; icon: typeof Flame }> = {
  LOW: { label: "Basse", className: "bg-muted text-muted-foreground border-border", icon: Clock },
  MEDIUM: { label: "Moyenne", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
  HIGH: { label: "Haute", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: AlertTriangle },
  URGENT: { label: "Urgente", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", icon: Flame },
};

export default function ProjectTasksPage() {
  const { id = "" } = useParams();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAssignee, setFilterAssignee] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  // Modal / Drawer state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  // Form states for creation
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("MEDIUM");
  const [newStartDate, setNewStartDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("TODO");

  // Drag & drop state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      getProjectTasks(id),
      getProjectMembers(id).catch(() => ({ items: [] })),
    ])
      .then(([tasksRes, membersRes]) => {
        if (active) {
          setTasks(tasksRes.tasks);
          setMembers(membersRes.items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger les données du projet.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (filterAssignee !== "ALL") {
        if (filterAssignee === "UNASSIGNED" && task.assigneeId) return false;
        if (filterAssignee !== "UNASSIGNED" && task.assigneeId !== filterAssignee) return false;
      }
      if (filterPriority !== "ALL" && (task.priority ?? "MEDIUM") !== filterPriority) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, filterAssignee, filterPriority]);

  // Handle Drag & Drop
  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingTaskId(taskId);
  }

  function handleDragOver(e: React.DragEvent, columnId: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragOverColumn(null);
  }

  async function handleDrop(e: React.DragEvent, columnId: TaskStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain") || draggingTaskId;
    setDraggingTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === columnId) return;

    // Optimistic Update
    const previousTasks = [...tasks];
    setTasks((current) =>
      current.map((t) => (t.id === taskId ? { ...t, status: columnId } : t))
    );

    try {
      await updateProjectTask(id, taskId, { status: columnId });
      setNotice(`Statut mis à jour : ${COLUMNS.find((c) => c.id === columnId)?.label}`);
    } catch {
      setTasks(previousTasks);
      setError("Erreur lors de la mise à jour du statut.");
    }
  }

  // Create Task
  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }

    const payload = {
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      assigneeId: newAssigneeId || null,
      priority: newPriority,
      startDate: newStartDate || null,
      dueDate: newDueDate || null,
      status: newStatus,
    };

    const parsed = createProjectTaskSchema.safeParse(payload);
    if (!parsed.success) {
      setError("Veuillez vérifier les informations saisies.");
      return;
    }

    setBusyId("create");
    setError("");
    setNotice("");

    try {
      const created = await createProjectTask(id, parsed.data);
      setTasks((current) => [...current, created as ProjectTask]);
      setIsCreateOpen(false);
      resetCreateForm();
      setNotice("Tâche créée avec succès.");
    } catch {
      setError("Impossible de créer la tâche.");
    } finally {
      setBusyId(null);
    }
  }

  function resetCreateForm() {
    setNewTitle("");
    setNewDescription("");
    setNewAssigneeId("");
    setNewPriority("MEDIUM");
    setNewStartDate("");
    setNewDueDate("");
    setNewStatus("TODO");
  }

  // Quick Status change
  async function changeStatus(task: ProjectTask, status: TaskStatus) {
    setBusyId(task.id);
    const previousTasks = [...tasks];
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, status } : t))
    );
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, status });
    }

    try {
      await updateProjectTask(id, task.id, { status });
      setNotice(`Tâche déplacée dans « ${COLUMNS.find((c) => c.id === status)?.label} »`);
    } catch {
      setTasks(previousTasks);
      setError("Erreur lors de la mise à jour du statut.");
    } finally {
      setBusyId(null);
    }
  }

  // Delete Task
  async function handleRemoveTask(task: ProjectTask) {
    if (!window.confirm(`Supprimer définitivement la tâche « ${task.title} » ?`)) return;
    setBusyId(task.id);
    try {
      await deleteProjectTask(id, task.id);
      setTasks((current) => current.filter((t) => t.id !== task.id));
      if (selectedTask?.id === task.id) {
        setSelectedTask(null);
      }
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
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Link
                to={`/projects/${id}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour au projet
              </Link>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-3">
                Gestion de projet & Tâches
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {tasks.length}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Pilotez les livrables, assignez les responsabilités et synchronisez l'effort d'équipe.
              </p>
            </div>

            {/* Actions & View switcher */}
            <div className="flex flex-wrap items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("board")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === "board"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Tableau (Kanban)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Liste
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === "calendar"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendrier
                </button>
              </div>

              <Button
                onClick={() => {
                  resetCreateForm();
                  setIsCreateOpen(true);
                }}
                className="h-9 gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-2xs"
              >
                <Plus className="h-4 w-4" />
                Nouvelle tâche
              </Button>
            </div>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">{error}</div>
              <button type="button" onClick={() => setError("")} className="text-destructive/70 hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">{notice}</div>
              <button type="button" onClick={() => setNotice("")} className="text-emerald-700/70 hover:text-emerald-700">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search & Filters Bar */}
          <Card className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre ou mot-clé..."
                  className="h-9 max-w-sm rounded-lg border border-border/80 bg-background text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Responsable :</span>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                  >
                    <option value="ALL">Tous les membres</option>
                    <option value="UNASSIGNED">Non assigné</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName || m.pseudonym || m.userId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Priorité :</span>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                  >
                    <option value="ALL">Toutes priorités</option>
                    <option value="URGENT">Urgente</option>
                    <option value="HIGH">Haute</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="LOW">Basse</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* MAIN VIEW CONTENT */}
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border bg-card text-muted-foreground">
              Chargement des tâches…
            </div>
          ) : viewMode === "board" ? (
            /* KANBAN BOARD */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {COLUMNS.map((col) => {
                const colTasks = filteredTasks.filter((t) => t.status === col.id);
                const isOver = dragOverColumn === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => void handleDrop(e, col.id)}
                    className={`flex flex-col rounded-xl border ${col.borderClass} ${col.bgClass} p-3 transition-colors ${
                      isOver ? "ring-2 ring-primary bg-primary/10" : ""
                    }`}
                  >
                    {/* Column Header */}
                    <div className="mb-3 flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {col.label}
                        </span>
                        <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-bold text-muted-foreground border border-border/50">
                          {colTasks.length}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          resetCreateForm();
                          setNewStatus(col.id);
                          setIsCreateOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title={`Ajouter une tâche dans ${col.label}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Column Task Cards */}
                    <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto max-h-[calc(100vh-320px)] min-h-[150px]">
                      {colTasks.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                          Déposez une tâche ici
                        </div>
                      ) : (
                        colTasks.map((task) => {
                          const priorityInfo = priorityBadges[task.priority ?? "MEDIUM"] || priorityBadges.MEDIUM;
                          const isDone = task.status === "DONE";
                          const PriorityIcon = priorityInfo.icon;

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onClick={() => {
                                setSelectedTask(task);
                              }}
                              className={`group relative flex cursor-grab flex-col gap-2.5 rounded-lg border border-border bg-card p-3.5 shadow-2xs transition-all hover:border-primary/50 hover:shadow-xs active:cursor-grabbing ${
                                isDone ? "opacity-75" : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${priorityInfo.className}`}>
                                  <PriorityIcon className="h-2.5 w-2.5" />
                                  {priorityInfo.label}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void handleRemoveTask(task);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <h4 className={`text-xs font-bold text-foreground leading-snug line-clamp-2 ${isDone ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </h4>

                              {task.description && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              {/* Card Footer */}
                              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                                <div className="flex items-center gap-1.5 truncate">
                                  {task.assigneePseudonym ? (
                                    <span className="flex items-center gap-1 font-medium text-foreground truncate">
                                      <UserRound className="h-3 w-3 text-primary" />
                                      {task.assigneePseudonym}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground/70 italic">Non assigné</span>
                                  )}
                                </div>

                                {task.dueDate && (
                                  <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                                    <CalendarIcon className="h-3 w-3" />
                                    {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : viewMode === "list" ? (
            /* TABLE / LIST VIEW */
            <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
              <div className="divide-y divide-border/50">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Aucune tâche correspondant aux filtres.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const priorityInfo = priorityBadges[task.priority ?? "MEDIUM"] || priorityBadges.MEDIUM;
                    const isDone = task.status === "DONE";

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                        }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/10 transition-colors cursor-pointer"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${priorityInfo.className}`}>
                              {priorityInfo.label}
                            </span>
                            <h3 className={`font-bold text-sm text-foreground ${isDone ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </h3>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground shrink-0">
                          {task.assigneePseudonym ? (
                            <span className="flex items-center gap-1">
                              <UserRound className="h-3.5 w-3.5 text-primary" />
                              {task.assigneePseudonym}
                            </span>
                          ) : (
                            <span className="italic">Sans responsable</span>
                          )}

                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                            </span>
                          )}

                          <select
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => void changeStatus(task, e.target.value as TaskStatus)}
                            className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleRemoveTask(task);
                            }}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          ) : (
            /* CALENDAR / TIMELINE VIEW */
            <Card className="rounded-xl border border-border bg-card p-6 shadow-2xs">
              <h2 className="font-heading text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Chronologie des livrables
              </h2>

              <div className="space-y-4">
                {filteredTasks.filter((t) => t.dueDate).length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Aucune tâche n'a d'échéance définie. Définissez des dates pour les visualiser dans le calendrier.
                  </div>
                ) : (
                  filteredTasks
                    .filter((t) => t.dueDate)
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                    .map((task) => {
                      const priorityInfo = priorityBadges[task.priority ?? "MEDIUM"] || priorityBadges.MEDIUM;
                      const dateFormatted = new Date(task.dueDate!).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={task.id}
                          onClick={() => {
                            setSelectedTask(task);
                          }}
                          className="flex items-center gap-4 rounded-lg border border-border p-3.5 hover:bg-muted/10 transition-colors cursor-pointer"
                        >
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                            <span className="text-[10px] font-bold uppercase">
                              {new Date(task.dueDate!).toLocaleDateString("fr-FR", { month: "short" })}
                            </span>
                            <span className="font-heading text-base font-bold">
                              {new Date(task.dueDate!).getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                {task.title}
                              </h4>
                              <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${priorityInfo.className}`}>
                                {priorityInfo.label}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground capitalize">{dateFormatted}</p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`rounded-md px-2 py-1 text-xs font-bold border ${COLUMNS.find((c) => c.id === task.status)?.badgeClass}`}>
                              {COLUMNS.find((c) => c.id === task.status)?.label}
                            </span>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Créer une tâche
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="text-xs font-semibold text-foreground">
                  Titre du livrable *
                </Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex. Rédiger le pitch deck, tester l'USSD..."
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="desc" className="text-xs font-semibold text-foreground">
                  Description détaillée
                </Label>
                <Textarea
                  id="desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Objectifs, critères de validation et liens utiles..."
                  className="min-h-[80px] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="assignee" className="text-xs font-semibold text-foreground">
                    Responsable
                  </Label>
                  <select
                    id="assignee"
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="">Non assigné</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName || m.pseudonym || m.userId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="priority" className="text-xs font-semibold text-foreground">
                    Priorité
                  </Label>
                  <select
                    id="priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="due" className="text-xs font-semibold text-foreground">
                    Date d'échéance
                  </Label>
                  <Input
                    id="due"
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="status" className="text-xs font-semibold text-foreground">
                    Colonne de départ
                  </Label>
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-2 text-xs font-medium"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8 text-xs font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={busyId === "create" || !newTitle.trim()}
                  className="h-8 text-xs font-semibold"
                >
                  {busyId === "create" ? "Création…" : "Enregistrer la tâche"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TASK DETAIL DRAWER / MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
              <div className="space-y-1">
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${priorityBadges[selectedTask.priority ?? "MEDIUM"]?.className}`}>
                  {priorityBadges[selectedTask.priority ?? "MEDIUM"]?.label}
                </span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {selectedTask.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">Description :</span>
                <p className="mt-1 text-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-3 rounded-lg border border-border/50">
                  {selectedTask.description || "Aucune description renseignée."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <span className="font-semibold text-muted-foreground">Responsable :</span>
                  <p className="mt-0.5 font-medium text-foreground">
                    {selectedTask.assigneePseudonym || "Non assigné"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Échéance :</span>
                  <p className="mt-0.5 font-medium text-foreground">
                    {selectedTask.dueDate
                      ? new Date(selectedTask.dueDate).toLocaleDateString("fr-FR")
                      : "Aucune"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Statut actuel :</span>
                  <div className="mt-1">
                    <select
                      value={selectedTask.status}
                      onChange={(e) => void changeStatus(selectedTask, e.target.value as TaskStatus)}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-semibold"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-muted-foreground">Création :</span>
                  <p className="mt-0.5 font-medium text-muted-foreground">
                    {new Date(selectedTask.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleRemoveTask(selectedTask)}
                className="h-8 gap-1.5 text-xs font-semibold"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedTask(null)}
                className="h-8 text-xs font-semibold"
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
