import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ImpactPage from "@/pages/ImpactPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import { MainLayout } from "@/components/layout/MainLayout";

const SearchPage = lazy(() => import("@/pages/SearchPage"));

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
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Routes avec Layout Global */}
          <Route element={<LayoutWrapper />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Routes Plein Écran (Auth & Onboarding) */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Applicatif (Dashboard & Search) */}
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/search" element={<SearchPage />} />
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
  );
}

export default App;
