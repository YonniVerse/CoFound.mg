import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ImpactPage from "@/pages/ImpactPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import ImportMappingPage from "@/pages/ImportMappingPage";
import ImportPreviewPage from "@/pages/ImportPreviewPage";
import ImportBatchesPage from "@/pages/ImportBatchesPage";
import LoginPage from "@/pages/LoginPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ActivationPage from "@/pages/ActivationPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";

const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes avec Layout Global */}
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Routes Plein Écran (Auth & Onboarding) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/activation/:token" element={<ActivationPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

        
        {/* Applicatif (Dashboard) */}
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/institution/imports" element={<ImportBatchesPage />} />
        <Route path="/institution/imports/:id" element={<ImportBatchesPage />} />
        <Route path="/institution/imports/new" element={<ImportMappingPage />} />
        <Route path="/institution/imports/preview" element={<ImportPreviewPage />} />
        <Route path="/institution/imports/:id/preview" element={<ImportPreviewPage />} />

        {/* Routes MVP non implémentées (Coming Soon) */}
        <Route path="/projects" element={<ComingSoonPage />} />
        <Route path="/profiles" element={<ComingSoonPage />} />
        <Route path="/messages" element={<ComingSoonPage />} />
        <Route path="/profile/me" element={<ComingSoonPage />} />
        <Route path="/settings" element={<ComingSoonPage />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
