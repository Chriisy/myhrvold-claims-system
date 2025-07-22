import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ClaimsFormAdvanced from "./pages/ClaimsFormAdvanced";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import SupplierManagement from "./pages/SupplierManagement";
import AdminSettings from "./pages/AdminSettings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><ClaimsList /></ProtectedRoute>} />
              <Route path="/claims/new" element={<ProtectedRoute><ClaimsFormAdvanced /></ProtectedRoute>} />
              <Route path="/claims/:id" element={<ProtectedRoute><ErrorBoundary><ClaimDetails /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/claims/:id/edit" element={<ProtectedRoute><ClaimsFormAdvanced /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute><SupplierManagement /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </PreferencesProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
