import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";
import { ApiClientError } from "@/lib/api-client";
import { addProjectMemberSchema, type ProjectMemberItem, type ProjectRoleInput } from "@cofound/shared";
import { addProjectMember, getProjectMembers, leaveProject, updateProjectMemberRole } from "@/data/projectApi";

type Role = ProjectRoleInput;
const roleLabels: Record<Role, string> = { OWNER: "Porteur", MEMBER: "Membre", MENTOR: "Mentor", OBSERVER: "Observateur" };

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
  const ownerCount = useMemo(() => members.filter((member) => member.role === "OWNER").length, [members]);

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
    getProjectMembers(projectId).then((response) => {
      if (active) { setMembers(response.items); setError(""); setLoading(false); }
    }).catch(() => {
      if (active) { setError("Impossible de charger l'équipe du projet."); setLoading(false); }
    });
    return () => { active = false; };
  }, [projectId]);

  async function addMember() {
    const parsed = addProjectMemberSchema.safeParse({ userId: newUserId, role: newRole });
    if (!parsed.success) { setError("Saisissez un identifiant de membre valide."); return; }
    setBusyId("add"); setError(""); setNotice("");
    try {
      await addProjectMember(projectId, parsed.data);
      setNewUserId(""); setNotice("Le membre a été ajouté à l'équipe."); await loadMembers();
    } catch { setError("Ce membre ne peut pas être ajouté ou appartient déjà à l'équipe."); }
    finally { setBusyId(null); }
  }

  async function updateRole(member: ProjectMemberItem, role: Role) {
    if (member.role === "OWNER" && role !== "OWNER" && ownerCount === 1) {
      setNotice("Le dernier porteur ne peut pas être rétrogradé. Transférez la propriété d'abord."); return;
    }
    setBusyId(member.id); setError(""); setNotice("");
    try {
      await updateProjectMemberRole(projectId, member.id, role);
      setMembers((current) => current.map((item) => item.id === member.id ? { ...item, role } : item));
      setNotice("Rôle mis à jour.");
    } catch (caught) {
      setError(caught instanceof ApiClientError && String(caught.code) === "LAST_OWNER" ? "Le dernier porteur ne peut pas être rétrogradé." : "Le rôle n'a pas pu être mis à jour.");
    } finally { setBusyId(null); }
  }

  async function removeSelf() {
    if (ownerCount === 1 && members.some((member) => member.role === "OWNER")) {
      setNotice("Le dernier porteur ne peut pas se retirer. Transférez la propriété d'abord."); return;
    }
    if (!window.confirm("Confirmer votre retrait du projet ? Le dévoilement déjà acquis restera irréversible.")) return;
    setBusyId("leave"); setError("");
    try { await leaveProject(projectId); setNotice("Vous avez quitté le projet."); await loadMembers(); }
    catch { setError("Impossible de quitter le projet."); }
    finally { setBusyId(null); }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Projet {projectId}</p><h1 className="mt-2 font-heading text-3xl font-bold text-foreground">L'équipe du projet</h1><p className="mt-2 max-w-2xl text-muted-foreground">Les membres acceptés se découvrent automatiquement dans cet espace privé. Aucune donnée de genre n'est affichée.</p></div>
      </div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {notice && <div role="status" className="mb-4 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">{notice}</div>}
      <section className="mb-6 rounded-2xl border border-border bg-background p-6 shadow-sm">
        <h2 className="font-heading text-lg font-bold">Ajouter un membre</h2><p className="mt-1 text-sm text-muted-foreground">Utilisez l'identifiant interne du talent accepté.</p>
        <div className="mt-4 flex flex-wrap gap-3"><input value={newUserId} onChange={(event) => setNewUserId(event.target.value)} placeholder="Identifiant du membre" aria-label="Identifiant du membre" className="min-w-64 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" /><select value={newRole} onChange={(event) => setNewRole(event.target.value as Role)} aria-label="Rôle du nouveau membre" className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"><option value="MEMBER">Membre</option><option value="MENTOR">Mentor</option><option value="OBSERVER">Observateur</option><option value="OWNER">Porteur</option></select><button disabled={busyId === "add"} onClick={() => void addMember()} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">{busyId === "add" ? "Ajout…" : "Ajouter"}</button></div>
      </section>
      <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 py-4"><h2 className="font-heading text-lg font-bold">Membres actifs</h2><p className="text-sm text-muted-foreground">{members.length} membre{members.length > 1 ? "s" : ""} · {ownerCount} porteur{ownerCount > 1 ? "s" : ""}</p></div>
        {loading ? <div className="px-6 py-12 text-center text-sm text-muted-foreground">Chargement de l'équipe…</div> : members.length === 0 ? <div className="px-6 py-12 text-center text-sm text-muted-foreground">Aucun membre actif dans ce projet.</div> : <div className="divide-y divide-border">{members.map((member) => <div key={member.id} className="flex flex-wrap items-center gap-4 px-6 py-5"><Avatar name={member.displayName ?? member.pseudonym ?? member.userId} size="sm" className="h-11 w-11 border border-border" /><div className="min-w-48 flex-1"><p className="font-bold text-foreground">{member.displayName ?? member.pseudonym ?? "Talent pseudonymisé"}</p><p className="text-sm text-muted-foreground">{member.functionalRole ?? "Membre du projet"}</p><p className="text-xs text-muted-foreground">Identité révélée entre membres acceptés</p></div><label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Rôle<select disabled={busyId === member.id} aria-label={`Rôle de ${member.pseudonym ?? member.userId}`} value={member.role} onChange={(event) => void updateRole(member, event.target.value as Role)} className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"><option value="OWNER">{roleLabels.OWNER}</option><option value="MEMBER">{roleLabels.MEMBER}</option><option value="MENTOR">{roleLabels.MENTOR}</option><option value="OBSERVER">{roleLabels.OBSERVER}</option></select></label>{member.role === "OWNER" && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Porteur</span>}</div>)}</div>}
      </section>
      <button onClick={() => void removeSelf()} disabled={busyId === "leave" || loading} className="mt-5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted disabled:opacity-50">{busyId === "leave" ? "Retrait…" : "Quitter le projet"}</button>
      <p className="mt-5 text-xs text-muted-foreground">La sortie d'un membre ne révoque pas un dévoilement déjà acquis, conformément à la règle TR-04.</p>
    </main>
  );
}
