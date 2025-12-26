import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import WineList from "./pages/WineList";
import Spirits from "./pages/Spirits";
import Cocktails from "./pages/Cocktails";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import WineQuiz from "./pages/WineQuiz";
import SpiritsQuiz from "./pages/SpiritsQuiz";
import AllergyQuiz from "./pages/AllergyQuiz";
import DailyFocus from "./pages/DailyFocus";
import Allergy from "./pages/Allergy";
import Admin from "./pages/Admin";
import AdminAssets from "./pages/AdminAssets";
import AdminUsers from "./pages/AdminUsers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:categoryId" element={<Categories />} />
            <Route path="/wine-list" element={<WineList />} />
            <Route path="/spirits" element={<Spirits />} />
            <Route path="/cocktails" element={<Cocktails />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/wine-quiz" element={<WineQuiz />} />
            <Route path="/spirits-quiz" element={<SpiritsQuiz />} />
            <Route path="/allergy-quiz" element={<AllergyQuiz />} />
            <Route path="/daily-focus" element={<DailyFocus />} />
            <Route path="/allergy" element={<Allergy />} />
            {/* Redirects for old routes */}
            <Route path="/allergy-check" element={<Navigate to="/allergy" replace />} />
            <Route path="/allergy-training" element={<Navigate to="/allergy" replace />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/assets" element={<AdminAssets />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
