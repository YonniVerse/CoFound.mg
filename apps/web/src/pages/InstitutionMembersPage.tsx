import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { institutionMemberInviteSchema, institutionMembersSchema, institutionOverviewSchema, type InstitutionMemberInvite, type InstitutionMembers } from '@cofound/shared'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'

export default function InstitutionMembersPage() {
  const [organizationId, setOrganizationId] = useState<string>()
  const [canManage, setCanManage] = useState(false)
  const [data, setData] = useState<InstitutionMembers>()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InstitutionMemberInvite['role']>('ORG_VIEWER')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const load = async () => { const overview = await apiClient.get('/institution/overview', institutionOverviewSchema); const org = overview.organizations[0]; if (!org) return; setOrganizationId(org.id); setCanManage(org.canManage); setData(await apiClient.get(`/organizations/${org.id}/members`, institutionMembersSchema)) }
  useEffect(() => { void Promise.resolve().then(load).catch(() => setError('Impossible de charger les membres.')) }, [])
  const invite = async () => { if (!organizationId) return; setBusy(true); setError(''); try { const input = institutionMemberInviteSchema.parse({ email, role }); await apiClient.post(`/organizations/${organizationId}/members`, input); setEmail(''); await load() } catch { setError('Invitation invalide ou déjà existante.') } finally { setBusy(false) } }
  return <DashboardLayout><main className="min-h-screen bg-muted/20 p-6 lg:p-10"><div className="mx-auto max-w-5xl space-y-6"><Link to="/institution" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Retour à la vue d’ensemble</Link><header><p className="text-sm font-semibold uppercase tracking-wider text-primary">Console établissement</p><h1 className="mt-2 text-3xl font-bold">Membres et rôles</h1><p className="mt-2 text-muted-foreground">Invitez vos collègues et attribuez des droits adaptés à leurs responsabilités.</p></header>{error && <p className="text-sm text-destructive">{error}</p>}{canManage && <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-primary" />Inviter un collègue</CardTitle></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row"><input className="h-10 flex-1 rounded-md border bg-background px-3 text-sm" type="email" placeholder="collegue@etablissement.mg" value={email} onChange={(event) => setEmail(event.target.value)} /><select className="h-10 rounded-md border bg-background px-3 text-sm" value={role} onChange={(event) => setRole(event.target.value as InstitutionMemberInvite['role'])}><option value="ORG_VIEWER">Lecteur — consultation</option><option value="ORG_MANAGER">Gestionnaire — imports et opérations</option><option value="ORG_ADMIN">Administrateur — membres et rôles</option></select><Button onClick={invite} disabled={busy || !email}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}Inviter</Button></CardContent></Card>}<Card><CardHeader><CardTitle>Membres de l’organisation</CardTitle></CardHeader><CardContent>{!data ? <div className="py-8 text-center text-muted-foreground"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div> : <div className="divide-y">{data.members.map((member) => <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between" key={member.id}><div><p className="font-medium">{member.email}</p><p className="text-sm text-muted-foreground">{member.status === 'ACTIVE' ? 'Compte activé' : 'Invitation en attente'}</p></div><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{member.role}</span></div>)}</div>}</CardContent></Card></div></main></DashboardLayout>
}
