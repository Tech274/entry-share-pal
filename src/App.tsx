import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import SubmitRequest from "./pages/SubmitRequest";
import MyRequests from "./pages/MyRequests";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import DeliveryPreview from "./pages/DeliveryPreview";
import MasterDataSheet from "./pages/MasterDataSheet";
import Auth from "./pages/Auth";
import Docs from "./pages/Docs";
import LabCatalog from "./pages/LabCatalog";
import PublicCatalog from "./pages/PublicCatalog";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes - no auth required */}
              <Route path="/" element={<Landing />} />
              <Route path="/submit-request" element={<SubmitRequest />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/lab-catalog" element={<LabCatalog />} />
              <Route path="/catalog" element={<PublicCatalog />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Protected routes - internal staff only */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/preview" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Preview />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/delivery-preview" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <DeliveryPreview />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/master-data-sheet" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <MasterDataSheet />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <Reports />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
