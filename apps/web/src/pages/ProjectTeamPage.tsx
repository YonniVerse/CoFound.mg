import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar } from "@/components/shared/Avatar";

type Role = "OWNER" | "MEMBER" | "MENTOR" | "OBSERVER";
type Member = { id: string; pseudonym: string; displayName?: string; functionalRole: string; role: Role; avatarSeed: string };

const initialMembers: Member[] = [
  { id: "m1", pseudonym: "Talent-42", displayName: "Rina Test", functionalRole: "Produit", role: "OWNER", avatarSeed: "rina" },
  { id: "m2", pseudonym: "Talent-18", displayName: "Miora Test", functionalRole: "Design", role: "MEMBER", avatarSeed: "miora" },
];

const roleLabels: Record<Role, string> = { OWNER: "Porteur", MEMBER: "Membre", MENTOR: "Mentor", OBSERVER: "Observateur" };

export default function ProjectTeamPage() {
  const { id = "project" } = useParams();
  const [members, setMembers] = useState(initialMembers);
  const [notice, setNotice] = useState("");
  const ownerCount = useMemo(() => members.filter((member) => member.role === "OWNER").length, [members]);

  function updateRole(memberId: string, role: Role) {
    const member = members.find((item) => item.id === memberId);
    if (!member || (member.role === "OWNER" && role !== "OWNER" && ownerCount === 1)) {
      setNotice("Le dernier porteur ne peut pas être rétrogradé. Transmettez la propriété d'abord.");
      return;
    }
    setMembers((current) => current.map((item) => item.id === memberId ? { ...item, role } : item));
    setNotice("Rôle mis à jour.");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Projet {id}</p><h1 className="mt-2 font-heading text-3xl font-bold text-foreground">L'équipe du projet</h1><p className="mt-2 max-w-2xl text-muted-foreground">Les membres acceptés se découvrent automatiquement dans cet espace privé. Aucune donnée de genre n'est affichée.</p></div>
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm hover:opacity-90">Ajouter un membre</button>
      </div>
      {notice && <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">{notice}</div>}
      <section className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="border-b border-border bg-muted/30 px-6 py-4"><h2 className="font-heading text-lg font-bold">Membres actifs</h2><p className="text-sm text-muted-foreground">{members.length} membre{members.length > 1 ? "s" : ""} · {ownerCount} porteur{ownerCount > 1 ? "s" : ""}</p></div>
        <div className="divide-y divide-border">
          {members.map((member) => <div key={member.id} className="flex flex-wrap items-center gap-4 px-6 py-5">
            <Avatar name={member.displayName ?? member.pseudonym} size="sm" className="h-11 w-11 border border-border" />
            <div className="min-w-48 flex-1"><p className="font-bold text-foreground">{member.displayName ?? member.pseudonym}</p><p className="text-sm text-muted-foreground">{member.functionalRole}</p><p className="text-xs text-muted-foreground">Identité révélée entre membres acceptés</p></div>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">Rôle<select aria-label={`Rôle de ${member.pseudonym}`} value={member.role} onChange={(event) => updateRole(member.id, event.target.value as Role)} className="rounded-lg border border-border bg-background px-3 py-2 text-foreground"><option value="OWNER">{roleLabels.OWNER}</option><option value="MEMBER">{roleLabels.MEMBER}</option><option value="MENTOR">{roleLabels.MENTOR}</option><option value="OBSERVER">{roleLabels.OBSERVER}</option></select></label>
            <button onClick={() => setNotice(member.role === "OWNER" && ownerCount === 1 ? "Le dernier porteur ne peut pas se retirer." : `${member.pseudonym} sera retiré après confirmation.`)} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">Retirer</button>
          </div>)}
        </div>
      </section>
      <p className="mt-5 text-xs text-muted-foreground">La sortie d'un membre ne révoque pas un dévoilement déjà acquis, conformément à la règle TR-04.</p>
    </main>
  );
}
