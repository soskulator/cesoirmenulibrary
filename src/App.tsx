import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import WineList from "./pages/WineList";
import Spirits from "./pages/Spirits";
import Cocktails from "./pages/Cocktails";
import CocktailFlashcards from "./pages/CocktailFlashcards";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import WineQuiz from "./pages/WineQuiz";
import SpiritsQuiz from "./pages/SpiritsQuiz";
import AllergyQuiz from "./pages/AllergyQuiz";
import FoodQuiz from "./pages/FoodQuiz";
import FohTest from "./pages/FohTest";
import DailyFocus from "./pages/DailyFocus";
import Allergy from "./pages/Allergy";
import Admin from "./pages/Admin";
import AdminAssets from "./pages/AdminAssets";
import AdminUsers from "./pages/AdminUsers";
import LeadAdminDashboard from "./pages/LeadAdminDashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/categories/:categoryId" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
              <Route path="/wine-list" element={<ProtectedRoute><WineList /></ProtectedRoute>} />
              <Route path="/spirits" element={<ProtectedRoute><Spirits /></ProtectedRoute>} />
              <Route path="/cocktails" element={<ProtectedRoute><Cocktails /></ProtectedRoute>} />
              <Route path="/cocktail-flashcards" element={<ProtectedRoute><CocktailFlashcards /></ProtectedRoute>} />
              <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
              <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
              <Route path="/wine-quiz" element={<ProtectedRoute><WineQuiz /></ProtectedRoute>} />
              <Route path="/spirits-quiz" element={<ProtectedRoute><SpiritsQuiz /></ProtectedRoute>} />
              <Route path="/allergy-quiz" element={<ProtectedRoute><AllergyQuiz /></ProtectedRoute>} />
              <Route path="/food-quiz" element={<ProtectedRoute><FoodQuiz /></ProtectedRoute>} />
              <Route path="/foh-test" element={<ProtectedRoute><FohTest /></ProtectedRoute>} />
              <Route path="/daily-focus" element={<ProtectedRoute><DailyFocus /></ProtectedRoute>} />
              <Route path="/allergy" element={<ProtectedRoute><Allergy /></ProtectedRoute>} />
              {/* Redirects for old routes */}
              <Route path="/allergy-check" element={<Navigate to="/allergy" replace />} />
              <Route path="/allergy-training" element={<Navigate to="/allergy" replace />} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/admin/assets" element={<ProtectedRoute><AdminAssets /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><LeadAdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
