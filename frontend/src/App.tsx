import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import SignupPage from "@/pages/SignupPage";
import OnboardingPage from "@/pages/OnboardingPage";
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
        
        {/* Pages à venir */}
        <Route path="/feed" element={<div className="min-h-screen flex items-center justify-center bg-background"><h1 className="text-2xl font-bold text-foreground">Feed (En cours de construction...)</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
