import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { MainLayout } from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProjectDetailPage = lazy(() => import("@/pages/ProjectDetailPage"));
const ImpactPage = lazy(() => import("@/pages/ImpactPage"));
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm font-medium">
    Chargement…
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Routes avec Layout Global */}
            <Route element={<LayoutWrapper />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Routes Plein Écran (Auth & Onboarding) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Applicatif (Dashboard) */}
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/impact" element={<ImpactPage />} />

            {/* Routes MVP non implémentées (Coming Soon) */}
            <Route path="/projects" element={<ComingSoonPage />} />
            <Route path="/profiles" element={<ComingSoonPage />} />
            <Route path="/messages" element={<ComingSoonPage />} />
            <Route path="/profile/me" element={<ComingSoonPage />} />
            <Route path="/settings" element={<ComingSoonPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
