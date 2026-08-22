import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import OrganizationRequestPage from "@/pages/OrganizationRequestPage";
import StaffOrganizationsPage from "@/pages/StaffOrganizationsPage";
import OrganizationProfilePage from "@/pages/OrganizationProfilePage";
import PartnerProjectsPage from "@/pages/PartnerProjectsPage";
import PartnerTalentsPage from "@/pages/PartnerTalentsPage";
import PartnerOpportunitiesPage from "@/pages/PartnerOpportunitiesPage";
import ActivationPage from "@/pages/ActivationPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProjectsFeedPage = lazy(() => import("@/pages/ProjectsFeedPage"));
const TalentsFeedPage = lazy(() => import("@/pages/TalentsFeedPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ProjectCreatePage = lazy(() => import("@/pages/ProjectCreatePage"));
const ImpactPage = lazy(() => import("@/pages/ImpactPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ImportMappingPage = lazy(() => import("@/pages/ImportMappingPage"));
const ImportPreviewPage = lazy(() => import("@/pages/ImportPreviewPage"));
const ImportBatchesPage = lazy(() => import("@/pages/ImportBatchesPage"));
const InstitutionOverviewPage = lazy(() => import("@/pages/InstitutionOverviewPage"));
const InstitutionMembersPage = lazy(() => import("@/pages/InstitutionMembersPage"));
const InstitutionAffiliationsPage = lazy(() => import("@/pages/InstitutionAffiliationsPage"));
const InstitutionDirectoryPage = lazy(() => import("@/pages/InstitutionDirectoryPage"));
const MyApplicationsPage = lazy(() => import("@/pages/MyApplicationsPage"));
const ProjectApplicationsPage = lazy(() => import("@/pages/ProjectApplicationsPage"));
const ProjectTeamPage = lazy(() => import("@/pages/ProjectTeamPage"));
const ProjectTasksPage = lazy(() => import("@/pages/ProjectTasksPage"));
const ProjectPostsPage = lazy(() => import("@/pages/ProjectPostsPage"));
const ProjectChannelPage = lazy(() => import("@/pages/ProjectChannelPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const ModerationQueuePage = lazy(() => import("@/pages/ModerationQueuePage"));
const ProjectExportPage = lazy(() => import("@/pages/ProjectExportPage"));
const ProjectPublicPage = lazy(() => import("@/pages/ProjectPublicPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const DreamMatchPage = lazy(() => import("@/pages/DreamMatchPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

const LayoutWrapper = () => <MainLayout><Outlet /></MainLayout>;
const Loading = () => <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Chargement…</div>;

function App() {
  return <AuthProvider><BrowserRouter><Suspense fallback={<Loading />}><Routes>
    <Route element={<LayoutWrapper />}><Route path="/" element={<LandingPage />} /></Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
    <Route path="/activation/:token" element={<ActivationPage />} />
    <Route path="/organization-request" element={<OrganizationRequestPage />} />
    <Route path="/staff/organizations" element={<StaffOrganizationsPage />} />
    <Route path="/organizations/:organizationId/profile" element={<OrganizationProfilePage />} />
    <Route path="/organizations/:organizationId/projects" element={<PartnerProjectsPage />} />
    <Route path="/organizations/:organizationId/talents" element={<PartnerTalentsPage />} />
    <Route path="/organizations/:organizationId/opportunities" element={<PartnerOpportunitiesPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/feed" element={<FeedPage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/dream-match" element={<DreamMatchPage />} />
    <Route path="/projects/new" element={<ProjectCreatePage />} />
    <Route path="/projects/:id" element={<ProjectDetailPage />} />
    <Route path="/projects/:id/applications" element={<ProjectApplicationsPage />} />
    <Route path="/projects/:id/team" element={<ProjectTeamPage />} />
    <Route path="/projects/:id/tasks" element={<ProjectTasksPage />} />
    <Route path="/projects/:id/posts" element={<ProjectPostsPage />} />
    <Route path="/projects/:id/channel" element={<ProjectChannelPage />} />
    <Route path="/projects/:id/export" element={<ProjectExportPage />} />
    <Route path="/projects/:id/public" element={<ProjectPublicPage />} />
    <Route path="/my-applications" element={<MyApplicationsPage />} />
    <Route path="/impact" element={<ImpactPage />} />
    <Route path="/institution" element={<InstitutionOverviewPage />} />
    <Route path="/institution/members" element={<InstitutionMembersPage />} />
    <Route path="/institution/affiliations" element={<InstitutionAffiliationsPage />} />
    <Route path="/institution/directory" element={<InstitutionDirectoryPage />} />
    <Route path="/institution/imports" element={<ImportBatchesPage />} />
    <Route path="/institution/imports/:id" element={<ImportBatchesPage />} />
    <Route path="/institution/imports/new" element={<ImportMappingPage />} />
    <Route path="/institution/imports/preview" element={<ImportPreviewPage />} />
    <Route path="/institution/imports/:id/preview" element={<ImportPreviewPage />} />
    <Route path="/projects" element={<ProjectsFeedPage />} />
    <Route path="/profiles" element={<TalentsFeedPage />} />
    <Route path="/messages" element={<MessagesPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/moderation" element={<ModerationQueuePage />} />
    <Route path="/profile/me" element={<OnboardingPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes></Suspense></BrowserRouter></AuthProvider>;
}

export default App;
