import { useEffect, useState, useCallback } from 'react'
import {
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Mail,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react'
import {
  institutionMemberInviteSchema,
  institutionMembersSchema,
  institutionOverviewSchema,
  type InstitutionMemberInvite,
  type InstitutionMembers,
} from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiClient } from '@/lib/api-client'
import { InstitutionHeader } from '@/components/institution/InstitutionHeader'

function getRoleBadge(role: string) {
  switch (role) {
    case 'ORG_ADMIN':
      return {
        label: 'Administrateur',
        className: 'bg-primary/10 text-primary border-primary/20',
        icon: ShieldAlert,
      }
    case 'ORG_MANAGER':
      return {
        label: 'Gestionnaire',
        className: 'bg-secondary/10 text-secondary border-secondary/20',
        icon: ShieldCheck,
      }
    case 'ORG_VIEWER':
    default:
      return {
        label: 'Lecteur',
        className: 'bg-muted text-muted-foreground border-border',
        icon: Shield,
      }
  }
}

export default function InstitutionMembersPage() {
  const [organizationId, setOrganizationId] = useState<string>()
  const [canManage, setCanManage] = useState(false)
  const [data, setData] = useState<InstitutionMembers>()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InstitutionMemberInvite['role']>('ORG_VIEWER')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setMessage(null)
    try {
      const overview = await apiClient.get('/institution/overview', institutionOverviewSchema)
      const org = overview.organizations[0]
      if (!org) return
      setOrganizationId(org.id)
      setCanManage(org.canManage)
      const membersData = await apiClient.get<InstitutionMembers>(
        `/organizations/${org.id}/members`,
        institutionMembersSchema,
      )
      setData(membersData)
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger la liste des membres.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  const inviteMember = async () => {
    if (!organizationId || !email.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      const input = institutionMemberInviteSchema.parse({
        email: email.trim().toLowerCase(),
        role,
      })
      await apiClient.post(`/organizations/${organizationId}/members`, input)
      setEmail('')
      setRole('ORG_VIEWER')
      setMessage({
        type: 'success',
        text: `Invitation envoyée avec succès à ${input.email}.`,
      })
      await loadMembers()
    } catch {
      setMessage({
        type: 'error',
        text: 'Impossible d’envoyer l’invitation. Vérifiez que l’email est valide et n’est pas déjà membre.',
      })
    } finally {
      setBusy(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (!organizationId) return
    try {
      await apiClient.patch(`/organizations/${organizationId}/members/${memberId}`, {
        role: newRole,
      })
      setMessage({ type: 'success', text: 'Rôle du membre mis à jour.' })
      await loadMembers()
    } catch {
      setMessage({
        type: 'error',
        text: 'Échec de la modification du rôle. Vous ne pouvez pas rétrograder le dernier administrateur.',
      })
    }
  }

  return (
    <DashboardLayout>
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
          <InstitutionHeader
            title="Membres & Droits d’accès"
            description="Gérez les collaborateurs ayant accès à la console de votre établissement et définissez leurs responsabilités."
            backHref="/institution/dashboard"
            backLabel="Tableau de bord"
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadMembers()}
                disabled={loading}
                className="h-9 gap-1.5 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            }
          />

          {message && (
            <div
              className={`flex items-center gap-3 rounded-xl border p-4 text-sm ${
                message.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border-destructive/20 bg-destructive/10 text-destructive'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <p className="flex-1 font-medium">{message.text}</p>
            </div>
          )}

          {/* Invitation Form Card */}
          {canManage && (
            <Card className="border-border/80 shadow-2xs">
              <CardHeader className="p-5 sm:p-6 pb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="font-heading text-base font-bold text-foreground">
                      Inviter un nouveau collaborateur
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Attribuez le rôle approprié en fonction des missions de votre collègue.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-3 space-y-4">
                <div className="grid gap-4 sm:grid-cols-12 sm:items-end">
                  <div className="sm:col-span-6 space-y-1.5">
                    <Label htmlFor="colleague-email" className="text-xs font-semibold text-foreground">
                      Adresse email professionnelle
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="colleague-email"
                        type="email"
                        placeholder="prenom.nom@etablissement.mg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-10 pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4 space-y-1.5">
                    <Label htmlFor="colleague-role" className="text-xs font-semibold text-foreground">
                      Rôle et permissions
                    </Label>
                    <select
                      id="colleague-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as InstitutionMemberInvite['role'])}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="ORG_VIEWER">Lecteur — Consultation seule</option>
                      <option value="ORG_MANAGER">Gestionnaire — Imports & Affiliations</option>
                      <option value="ORG_ADMIN">Administrateur — Gestion totale & Équipe</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      onClick={() => void inviteMember()}
                      disabled={busy || !email.trim()}
                      className="h-10 w-full gap-2 text-xs font-semibold"
                    >
                      {busy ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="h-3.5 w-3.5" />
                      )}
                      Inviter
                    </Button>
                  </div>
                </div>

                {/* Role descriptions info box */}
                <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3 text-xs text-muted-foreground">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <span className="font-semibold text-foreground">Lecteur :</span> Accès au tableau de bord et à l'annuaire des étudiants.
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <span className="font-semibold text-foreground">Gestionnaire :</span> Import de promotions et modification des statuts d'affiliation.
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-2.5">
                    <span className="font-semibold text-foreground">Administrateur :</span> Gestion des membres, des rôles et configuration de l'établissement.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members List Table */}
          <Card className="overflow-hidden border-border/80 shadow-2xs">
            <CardHeader className="border-b border-border/60 p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="font-heading text-base font-bold text-foreground">
                    Collaborateurs de l'établissement ({data?.members.length ?? 0})
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-2">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-44" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : !data || data.members.length === 0 ? (
                <p className="p-8 text-center text-sm text-muted-foreground">
                  Aucun membre trouvé dans cet établissement.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-3.5">Membre</th>
                        <th className="px-4 py-3.5">Statut du compte</th>
                        <th className="px-4 py-3.5">Rôle assigné</th>
                        <th className="px-4 py-3.5">Date d'ajout</th>
                        {canManage && <th className="px-6 py-3.5 text-right">Modifier rôle</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {data.members.map((member) => {
                        const badge = getRoleBadge(member.role)
                        const BadgeIcon = badge.icon
                        const initial = member.email.charAt(0).toUpperCase()

                        return (
                          <tr key={member.id} className="transition-colors hover:bg-muted/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground truncate">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-xs">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                                  member.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-700'
                                    : 'bg-amber-500/10 text-amber-700'
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {member.status === 'ACTIVE' ? 'Actif' : 'Invitation en attente'}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                              >
                                <BadgeIcon className="h-3 w-3" />
                                {badge.label}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-xs text-muted-foreground">
                              {member.createdAt
                                ? new Date(member.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </td>

                            {canManage && (
                              <td className="px-6 py-4 text-right">
                                <select
                                  value={member.role}
                                  onChange={(e) => void handleRoleChange(member.id, e.target.value)}
                                  className="h-8 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
                                >
                                  <option value="ORG_VIEWER">Lecteur</option>
                                  <option value="ORG_MANAGER">Gestionnaire</option>
                                  <option value="ORG_ADMIN">Administrateur</option>
                                </select>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Responsibility Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="leading-relaxed">
              <strong>Sécurité des comptes :</strong> Seuls les membres désignés en tant qu'administrateurs peuvent gérer les membres et assigner le rôle `ORG_ADMIN`. Le dernier administrateur ne peut pas être rétrogradé afin de garantir la continuité opérationnelle.
            </p>
          </div>
        </div>
      </main>
    </DashboardLayout>
  )
}
