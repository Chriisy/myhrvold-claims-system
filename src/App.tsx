import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useOptimizedAuth";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConnectionStatus } from "./components/ui/ConnectionStatus";
import { CookieConsent } from "./components/gdpr/CookieConsent";
import { ThemeProvider } from "./hooks/useTheme";
import { useGlobalShortcuts } from "./hooks/useKeyboardShortcuts";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/AnalyticsEnhanced";
import ClaimsFormAdvanced from "./pages/ClaimsFormAdvanced";
import ClaimsForm from "./pages/ClaimsForm";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import { ClaimEconomics } from "./pages/ClaimEconomics";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "./components/ui/loading";

// Lazy load admin components for better performance
const SupplierManagement = lazy(() => import("./pages/SupplierManagement"));
const SupplierScorecard = lazy(() => import("./pages/SupplierScorecard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

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

function AppRoutes() {
  useGlobalShortcuts();
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute><ClaimsList /></ProtectedRoute>} />
      <Route path="/claims/new" element={<ProtectedRoute><ClaimsForm /></ProtectedRoute>} />
      <Route path="/claims/new-advanced" element={<ProtectedRoute><ClaimsFormAdvanced /></ProtectedRoute>} />
      <Route path="/claims/:id" element={<ProtectedRoute><ErrorBoundary><ClaimDetails /></ErrorBoundary></ProtectedRoute>} />
      <Route path="/claims/:id/edit" element={<ProtectedRoute><ClaimsFormAdvanced /></ProtectedRoute>} />
      <Route path="/claims/:id/economics" element={<ProtectedRoute><ClaimEconomics /></ProtectedRoute>} />
      <Route path="/suppliers" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <SupplierManagement />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/suppliers/scorecard" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <SupplierScorecard />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <AdminSettings />
          </Suspense>
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="claims-theme">
        <PreferencesProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ConnectionStatus />
              <BrowserRouter>
                <AppRoutes />
                <CookieConsent />
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
