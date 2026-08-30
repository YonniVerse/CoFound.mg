import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import { accountStatusResponseSchema } from '@cofound/shared'
import { apiClient } from '@/lib/api-client'
import LandingPage from "@/pages/LandingPage";
import OrganizationRequestPage from "@/pages/OrganizationRequestPage";
import StaffOrganizationsPage from "@/pages/StaffOrganizationsPage";
import OrganizationProfilePage from "@/pages/OrganizationProfilePage";
import PartnerProjectsPage from "@/pages/PartnerProjectsPage";
import PartnerTalentsPage from "@/pages/PartnerTalentsPage";
import PartnerOpportunitiesPage from "@/pages/PartnerOpportunitiesPage";
import OpportunityDetailPage from "@/pages/OpportunityDetailPage";
import WalletPage from "@/pages/WalletPage";
import ActivationPage from "@/pages/ActivationPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { PlatformRoleGate } from "@/components/auth/PlatformRoleGate";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProjectsFeedPage = lazy(() => import("@/pages/ProjectsFeedPage"));
const TalentsFeedPage = lazy(() => import("@/pages/TalentsFeedPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ProjectCreatePage = lazy(() => import("@/pages/ProjectCreatePage"));
const ProjectBmcPage = lazy(() => import("@/pages/ProjectBmcPage"));
const ImpactPage = lazy(() => import("@/pages/ImpactPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AccountStatusPage = lazy(() => import("@/pages/AccountStatusPage"));
const ImportMappingPage = lazy(() => import("@/pages/ImportMappingPage"));
const ImportPreviewPage = lazy(() => import("@/pages/ImportPreviewPage"));
const ImportBatchesPage = lazy(() => import("@/pages/ImportBatchesPage"));
const InstitutionOverviewPage = lazy(() => import("@/pages/InstitutionOverviewPage"));
const InstitutionMembersPage = lazy(() => import("@/pages/InstitutionMembersPage"));
const InstitutionAffiliationsPage = lazy(() => import("@/pages/InstitutionAffiliationsPage"));
const InstitutionDirectoryPage = lazy(() => import("@/pages/InstitutionDirectoryPage"));
const MyApplicationsPage = lazy(() => import("@/pages/MyApplicationsPage"));
const ProjectApplicationsPage = lazy(() => import("@/pages/ProjectApplicationsPage"));
const IncubatorProgramsPage = lazy(() => import("@/pages/IncubatorProgramsPage"));
const ProjectTeamPage = lazy(() => import("@/pages/ProjectTeamPage"));
const ProjectTasksPage = lazy(() => import("@/pages/ProjectTasksPage"));
const ProjectPostsPage = lazy(() => import("@/pages/ProjectPostsPage"));
const ProjectChannelPage = lazy(() => import("@/pages/ProjectChannelPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ModerationQueuePage = lazy(() => import("@/pages/ModerationQueuePage"));
const AuditLogPage = lazy(() => import("@/pages/AuditLogPage"));
const ReferenceDataPage = lazy(() => import("@/pages/ReferenceDataPage"));
const ProductHealthPage = lazy(() => import("@/pages/ProductHealthPage"));
const ProjectExportPage = lazy(() => import("@/pages/ProjectExportPage"));
const ProjectPublicPage = lazy(() => import("@/pages/ProjectPublicPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const DreamMatchPage = lazy(() => import("@/pages/DreamMatchPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

const LayoutWrapper = () => <MainLayout><Outlet /></MainLayout>;
const Loading = () => <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Chargement…</div>;

function AccountStatusBoundary({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (location.pathname === '/account-status') return
    let mounted = true
    void apiClient.get('/me/status', accountStatusResponseSchema).then((status) => {
      if (mounted && status.status === 'FROZEN') navigate('/account-status', { replace: true })
    }).catch(() => undefined)
    return () => { mounted = false }
  }, [location.pathname, navigate])
  return <>{children}</>
}

function App() {
  return <AuthProvider><BrowserRouter><AccountStatusBoundary><Suspense fallback={<Loading />}><Routes>
    <Route element={<LayoutWrapper />}><Route path="/" element={<LandingPage />} /></Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    <Route path="/activation/:token" element={<ActivationPage />} />
    <Route path="/organization-request" element={<OrganizationRequestPage />} />
    <Route path="/staff/organizations" element={<PlatformRoleGate allowedRoles={["STAFF"]}><StaffOrganizationsPage /></PlatformRoleGate>} />
    <Route path="/organizations/:organizationId/profile" element={<OrganizationProfilePage />} />
    <Route path="/organizations/:organizationId/projects" element={<PartnerProjectsPage />} />
    <Route path="/organizations/:organizationId/talents" element={<PartnerTalentsPage />} />
    <Route path="/organizations/:organizationId/opportunities" element={<PartnerOpportunitiesPage />} />
    <Route path="/organizations/:organizationId/incubator" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><IncubatorProgramsPage /></PlatformRoleGate>} />
    <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
    <Route path="/organizations/:organizationId/wallet" element={<WalletPage />} />
    <Route path="/projects/:id/wallet" element={<WalletPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/dream-match" element={<DreamMatchPage />} />
    <Route path="/projects/new" element={<ProjectCreatePage />} />
    <Route path="/projects/:id/bmc" element={<ProjectBmcPage />} />
    <Route path="/projects/:id" element={<ProjectDetailPage />} />
    <Route path="/projects/:id/bmc" element={<ProjectBmcPage />} />
    <Route path="/projects/:id/applications" element={<ProjectApplicationsPage />} />
    <Route path="/projects/:id/team" element={<ProjectTeamPage />} />
    <Route path="/projects/:id/tasks" element={<ProjectTasksPage />} />
    <Route path="/projects/:id/posts" element={<ProjectPostsPage />} />
    <Route path="/projects/:id/channel" element={<ProjectChannelPage />} />
    <Route path="/projects/:id/export" element={<ProjectExportPage />} />
    <Route path="/projects/:id/public" element={<ProjectPublicPage />} />
    <Route path="/my-applications" element={<MyApplicationsPage />} />
    <Route path="/impact" element={<ImpactPage />} />
    <Route path="/institution" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><InstitutionOverviewPage /></PlatformRoleGate>} />
    <Route path="/institution/members" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><InstitutionMembersPage /></PlatformRoleGate>} />
    <Route path="/institution/affiliations" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><InstitutionAffiliationsPage /></PlatformRoleGate>} />
    <Route path="/institution/directory" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><InstitutionDirectoryPage /></PlatformRoleGate>} />
    <Route path="/institution/imports" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><ImportBatchesPage /></PlatformRoleGate>} />
    <Route path="/institution/imports/:id" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><ImportBatchesPage /></PlatformRoleGate>} />
    <Route path="/institution/imports/new" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><ImportMappingPage /></PlatformRoleGate>} />
    <Route path="/institution/imports/preview" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><ImportPreviewPage /></PlatformRoleGate>} />
    <Route path="/institution/imports/:id/preview" element={<PlatformRoleGate allowedRoles={["ORG_MEMBER"]}><ImportPreviewPage /></PlatformRoleGate>} />
    <Route path="/projects" element={<ProjectsFeedPage />} />
    <Route path="/projects/feed" element={<ProjectsFeedPage />} />
    <Route path="/profiles" element={<TalentsFeedPage />} />
    <Route path="/talents/feed" element={<TalentsFeedPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/moderation" element={<PlatformRoleGate allowedRoles={["STAFF"]}><ModerationQueuePage /></PlatformRoleGate>} />
    <Route path="/staff/audit" element={<PlatformRoleGate allowedRoles={["STAFF"]}><AuditLogPage /></PlatformRoleGate>} />
    <Route path="/staff/reference-data" element={<PlatformRoleGate allowedRoles={["STAFF"]}><ReferenceDataPage /></PlatformRoleGate>} />
    <Route path="/staff/health" element={<PlatformRoleGate allowedRoles={["STAFF"]}><ProductHealthPage /></PlatformRoleGate>} />
    <Route path="/profile/me" element={<ProfilePage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/account-status" element={<AccountStatusPage />} />
  </Routes></Suspense></AccountStatusBoundary></BrowserRouter></AuthProvider>;
}

export default App;
