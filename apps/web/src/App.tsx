import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import ImpactPage from "@/pages/ImpactPage";
import ComingSoonPage from "@/pages/ComingSoonPage";
import { MainLayout } from "@/components/layout/MainLayout";

const LayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes avec Layout Global */}
        <Route element={<LayoutWrapper />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        {/* Routes Plein Écran (Auth & Onboarding) */}
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
    </BrowserRouter>
  );
}

export default App;
