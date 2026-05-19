import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
import FeedPage from "@/pages/FeedPage";
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
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Applicatif (Dashboard) */}
        <Route path="/feed" element={<FeedPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
