import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { MainLayout } from "@/components/layout/MainLayout";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ProjectCreatePage = lazy(() => import("@/pages/ProjectCreatePage"));
const ImpactPage = lazy(() => import("@/pages/ImpactPage"));
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ImportMappingPage = lazy(() => import("@/pages/ImportMappingPage"));
const ImportPreviewPage = lazy(() => import("@/pages/ImportPreviewPage"));
const ImportBatchesPage = lazy(() => import("@/pages/ImportBatchesPage"));
const InstitutionOverviewPage = lazy(() => import("@/pages/InstitutionOverviewPage"));
const InstitutionMembersPage = lazy(() => import("@/pages/InstitutionMembersPage"));
const MyApplicationsPage = lazy(() => import("@/pages/MyApplicationsPage"));
const ProjectApplicationsPage = lazy(() => import("@/pages/ProjectApplicationsPage"));
const ProjectTeamPage = lazy(() => import("@/pages/ProjectTeamPage"));
const ProjectTasksPage = lazy(() => import("@/pages/ProjectTasksPage"));
const ProjectPostsPage = lazy(() => import("@/pages/ProjectPostsPage"));
const ProjectChannelPage = lazy(() => import("@/pages/ProjectChannelPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const ProjectExportPage = lazy(() => import("@/pages/ProjectExportPage"));
const ProjectPublicPage = lazy(() => import("@/pages/ProjectPublicPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const DreamMatchPage = lazy(() => import("@/pages/DreamMatchPage"));

const LayoutWrapper = () => <MainLayout><Outlet /></MainLayout>;
const Loading = () => <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Chargement…</div>;

function App() {
  return <BrowserRouter><Suspense fallback={<Loading />}><Routes>
    <Route element={<LayoutWrapper />}><Route path="/" element={<LandingPage />} /></Route>
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
    <Route path="/institution/imports" element={<ImportBatchesPage />} />
    <Route path="/institution/imports/:id" element={<ImportBatchesPage />} />
    <Route path="/institution/imports/new" element={<ImportMappingPage />} />
    <Route path="/institution/imports/preview" element={<ImportPreviewPage />} />
    <Route path="/institution/imports/:id/preview" element={<ImportPreviewPage />} />
    <Route path="/projects" element={<ComingSoonPage />} />
    <Route path="/profiles" element={<ComingSoonPage />} />
    <Route path="/messages" element={<MessagesPage />} />
    <Route path="/profile/me" element={<ComingSoonPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes></Suspense></BrowserRouter>;
}

export default App;
