import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SessionTracker } from "@/components/SessionTracker";

// ─── All pages lazy-loaded ───
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ─── Lazy-loaded pages (split into separate chunks) ───
const Categories = lazy(() => import("./pages/Categories"));
const WineList = lazy(() => import("./pages/WineList"));
const Spirits = lazy(() => import("./pages/Spirits"));
const Cocktails = lazy(() => import("./pages/Cocktails"));
const CocktailFlashcards = lazy(() => import("./pages/CocktailFlashcards"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Quiz = lazy(() => import("./pages/Quiz"));
const WineQuiz = lazy(() => import("./pages/WineQuiz"));
const SpiritsQuiz = lazy(() => import("./pages/SpiritsQuiz"));
const AllergyQuiz = lazy(() => import("./pages/AllergyQuiz"));
const FoodQuiz = lazy(() => import("./pages/FoodQuiz"));
const FohTest = lazy(() => import("./pages/FohTest"));
const DailyFocus = lazy(() => import("./pages/DailyFocus"));
const Allergy = lazy(() => import("./pages/Allergy"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminAssets = lazy(() => import("./pages/AdminAssets"));
const AdminUsers = lazy(() => import("./pages/AdminUsers"));
const LeadAdminDashboard = lazy(() => import("./pages/LeadAdminDashboard"));
const AdminSeedQuestions = lazy(() => import("./pages/AdminSeedQuestions"));
const QuizBuilder = lazy(() => import("./pages/QuizBuilder"));
const ScoringDashboard = lazy(() => import("./pages/ScoringDashboard"));

// ─── Role constants (single source of truth) ───
const ROLES = {
  ALL_STAFF: ["lead_admin", "admin", "server", "bartender", "employee"] as const,
  ADMIN: ["admin", "lead_admin"] as const,
  LEAD_ONLY: "lead_admin" as const,
  FOH_STAFF: ["lead_admin", "admin", "server", "bartender"] as const,
};

// ─── Loading fallback for lazy routes ───
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cream">
    <LoadingSpinner />
  </div>
);

// ─── QueryClient with sensible caching for a training app ───
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SessionTracker />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public routes ── */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ── Protected routes — any authenticated user ── */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories/:categoryId"
                  element={
                    <ProtectedRoute>
                      <Categories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/flashcards"
                  element={
                    <ProtectedRoute>
                      <Flashcards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <Quiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/allergy-quiz"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.FOH_STAFF]}>
                      <AllergyQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/food-quiz"
                  element={
                    <ProtectedRoute>
                      <FoodQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/foh-test"
                  element={
                    <ProtectedRoute>
                      <FohTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/daily-focus"
                  element={
                    <ProtectedRoute>
                      <DailyFocus />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/allergy"
                  element={
                    <ProtectedRoute>
                      <Allergy />
                    </ProtectedRoute>
                  }
                />

                {/* ── Role-restricted routes — all staff roles ── */}
                <Route
                  path="/wine-list"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <WineList />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spirits"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <Spirits />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cocktails"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <Cocktails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cocktail-flashcards"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <CocktailFlashcards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wine-quiz"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <WineQuiz />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/spirits-quiz"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ALL_STAFF]}>
                      <SpiritsQuiz />
                    </ProtectedRoute>
                  }
                />

                {/* ── Admin routes ── */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ADMIN]}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/assets"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ADMIN]}>
                      <AdminAssets />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requiredRole={ROLES.LEAD_ONLY}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requiredRole={ROLES.LEAD_ONLY}>
                      <LeadAdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/seed-questions"
                  element={
                    <ProtectedRoute requiredRole={ROLES.LEAD_ONLY}>
                      <AdminSeedQuestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quiz-builder"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ADMIN]}>
                      <QuizBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/scoring"
                  element={
                    <ProtectedRoute requiredRole={[...ROLES.ADMIN]}>
                      <ScoringDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* ── Redirects for old routes ── */}
                <Route path="/allergy-check" element={<Navigate to="/allergy" replace />} />
                <Route path="/allergy-training" element={<Navigate to="/allergy" replace />} />

                {/* ── 404 ── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
