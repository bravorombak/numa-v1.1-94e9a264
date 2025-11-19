import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import TeamPage from "./pages/TeamPage";
import StoragePage from "./pages/StoragePage";
import CategoriesEditPage from "./pages/CategoriesEditPage";
import AdminApiPage from "./pages/AdminApiPage";
import PromptEditorPage from "./pages/PromptEditorPage";
import PromptRunPage from "./pages/PromptRunPage";
import ChatPage from "./pages/ChatPage";
import GuidePage from "./pages/GuidePage";
import GuideDetailPage from "./pages/GuideDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/storage" element={<StoragePage />} />
            <Route path="/categories/edit" element={<CategoriesEditPage />} />
            <Route path="/admin/api" element={<AdminApiPage />} />
            <Route path="/prompts/:id/edit" element={<PromptEditorPage />} />
            <Route path="/prompts/:id/run" element={<PromptRunPage />} />
            <Route path="/chat/:sessionId" element={<ChatPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/:id" element={<GuideDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
