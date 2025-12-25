import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Categories from "./pages/Categories";
import Flashcards from "./pages/Flashcards";
import Quiz from "./pages/Quiz";
import DailyFocus from "./pages/DailyFocus";
import AllergyCheck from "./pages/AllergyCheck";
import Admin from "./pages/Admin";
import AdminAssets from "./pages/AdminAssets";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/categories/:categoryId" element={<Categories />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/daily-focus" element={<DailyFocus />} />
          <Route path="/allergy-check" element={<AllergyCheck />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/assets" element={<AdminAssets />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
