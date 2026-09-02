import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Crown,
  LogOut,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Avatar } from "@/components/shared/Avatar";
import { ApiClientError } from "@/lib/api-client";
import {
  addProjectMemberSchema,
  type ProjectMemberItem,
  type ProjectRoleInput,
} from "@cofound/shared";
import {
  addProjectMember,
  getProjectMembers,
  leaveProject,
  updateProjectMemberRole,
} from "@/data/projectApi";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProjectNavTabs } from "@/components/project/ProjectNavTabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = ProjectRoleInput;
const roleLabels: Record<Role, string> = {
  OWNER: "Porteur",
  MEMBER: "Membre",
  MENTOR: "Mentor",
  OBSERVER: "Observateur",
};

export default function ProjectTeamPage() {
  const { id } = useParams();
  const projectId = id ?? "";
  const [members, setMembers] = useState<ProjectMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<Role>("MEMBER");
  const ownerCount = useMemo(
    () => members.filter((member) => member.role === "OWNER").length,
    [members],
  );

  async function loadMembers() {
    if (!projectId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getProjectMembers(projectId);
      setMembers(response.items);
    } catch {
      setError("Impossible de charger l'équipe du projet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    if (!projectId) return () => { active = false; };
    getProjectMembers(projectId)
      .then((response) => {
        if (active) {
          setMembers(response.items);
          setError("");
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Impossible de charger l'équipe du projet.");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [projectId]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const parsed = addProjectMemberSchema.safeParse({
      userId: newUserId.trim(),
      role: newRole,
    });
    if (!parsed.success) {
      setError("Saisissez un identifiant de membre valide.");
      return;
    }
    setBusyId("add");
    setError("");
    setNotice("");
    try {
      await addProjectMember(projectId, parsed.data);
      setNewUserId("");
      setNotice("Le membre a été ajouté à l'équipe.");
      await loadMembers();
    } catch {
      setError("Ce membre ne peut pas être ajouté ou appartient déjà à l'équipe.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateRole(member: ProjectMemberItem, role: Role) {
    if (member.role === "OWNER" && role !== "OWNER" && ownerCount === 1) {
      setNotice("Le dernier porteur ne peut pas être rétrogradé. Transférez la propriété d'abord.");
      return;
    }
    setBusyId(member.id);
    setError("");
    setNotice("");
    try {
      await updateProjectMemberRole(projectId, member.id, role);
      setMembers((current) =>
        current.map((item) => (item.id === member.id ? { ...item, role } : item)),
      );
      setNotice("Rôle mis à jour avec succès.");
    } catch (caught) {
      setError(
        caught instanceof ApiClientError && String(caught.code) === "LAST_OWNER"
          ? "Le dernier porteur ne peut pas être rétrogradé."
          : "Le rôle n'a pas pu être mis à jour.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function removeSelf() {
    if (ownerCount === 1 && members.some((member) => member.role === "OWNER")) {
      setNotice("Le dernier porteur ne peut pas se retirer. Transférez la propriété d'abord.");
      return;
    }
    if (
      !window.confirm(
        "Confirmer votre retrait du projet ? Le dévoilement déjà acquis restera irréversible.",
      )
    )
      return;
    setBusyId("leave");
    setError("");
    try {
      await leaveProject(projectId);
      setNotice("Vous avez quitté le projet.");
      await loadMembers();
    } catch {
      setError("Impossible de quitter le projet.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <DashboardLayout>
      <ProjectNavTabs projectId={projectId} />

      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <Link
                to={`/projects/${projectId}`}
                className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Retour au projet
              </Link>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                L'équipe du projet
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gérez les membres, leurs responsabilités et les accès à l'espace de travail.
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

          {notice && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Add member form */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-2xs sm:p-6">
            <h2 className="font-heading text-base font-bold text-foreground sm:text-lg flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Ajouter un membre
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Intégrez un talent directement via son identifiant de profil.
            </p>

            <form onSubmit={addMember} className="mt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="member-id" className="sr-only">
                  Identifiant du membre
                </Label>
                <Input
                  id="member-id"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="Identifiant du membre (ex. talent-123...)"
                  className="h-10 rounded-lg border border-border/80 bg-background text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="w-full sm:w-40 space-y-1">
                <Label htmlFor="member-role" className="sr-only">
                  Rôle
                </Label>
                <select
                  id="member-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="h-10 w-full rounded-lg border border-border/80 bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="MEMBER">Membre</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="OBSERVER">Observateur</option>
                  <option value="OWNER">Porteur</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={busyId === "add" || !newUserId.trim()}
                className="h-10 shrink-0 gap-1.5 rounded-lg px-4 text-xs font-semibold"
              >
                <UserPlus className="h-4 w-4" />
                {busyId === "add" ? "Ajout…" : "Ajouter"}
              </Button>
            </form>
          </Card>

          {/* Members list */}
          <Card className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  Membres actifs ({members.length})
                </h2>
                <p className="text-xs text-muted-foreground">
                  {ownerCount} porteur{ownerCount > 1 ? "s" : ""} de projet
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">
                Chargement de l'équipe…
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center text-xs sm:text-sm text-muted-foreground">
                Aucun membre actif dans ce projet.
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {members.map((member) => {
                  const isOwner = member.role === "OWNER";
                  const memberName =
                    member.displayName ?? member.pseudonym ?? "Talent CoFound";

                  return (
                    <div
                      key={member.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:px-6 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <Avatar
                          name={memberName}
                          size="md"
                          className="h-11 w-11 rounded-full border border-border/70 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground truncate">
                              {memberName}
                            </p>
                            {isOwner && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                <Crown className="h-3 w-3" />
                                Porteur
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {member.functionalRole ?? "Membre de l’équipe"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                          <span>Rôle</span>
                          <select
                            disabled={busyId === member.id}
                            value={member.role}
                            onChange={(e) =>
                              void updateRole(member, e.target.value as Role)
                            }
                            className="h-9 rounded-lg border border-border/80 bg-background px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                          >
                            <option value="OWNER">{roleLabels.OWNER}</option>
                            <option value="MEMBER">{roleLabels.MEMBER}</option>
                            <option value="MENTOR">{roleLabels.MENTOR}</option>
                            <option value="OBSERVER">{roleLabels.OBSERVER}</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Privacy & Leave Project section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-start gap-2.5 text-xs text-muted-foreground max-w-xl">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                Conformément à la règle TR-04, les membres d'une même équipe ont accès à leur identité révélée pour collaborer. Le départ d'un membre ne révoque pas les dévoilements déjà acquis.
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void removeSelf()}
              disabled={busyId === "leave" || loading}
              className="h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              {busyId === "leave" ? "Retrait…" : "Quitter le projet"}
            </Button>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
