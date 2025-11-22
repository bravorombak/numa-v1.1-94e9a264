import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
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
import GuideViewerPage from "./pages/GuideViewerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
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
          <Route path="/guide-view" element={<GuideViewerPage />} />
          <Route path="/guide-view/:id" element={<GuideViewerPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
