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
import { useAutoLogout } from "./hooks/useAutoLogout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/AnalyticsEnhanced";
import ClaimsFormAdvanced from "./pages/ClaimsFormAdvanced";
import ClaimsList from "./pages/ClaimsList";
import ClaimDetails from "./pages/ClaimDetails";
import { ClaimEconomics } from "./pages/ClaimEconomics";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import PublicClaimView from "./pages/PublicClaimView";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "./components/ui/loading";

// Lazy load admin components for better performance
const SupplierManagement = lazy(() => import("./pages/SupplierManagement"));
const SupplierScorecard = lazy(() => import("./pages/SupplierScorecard"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));

// Lazy load maintenance components
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const NewMaintenanceAgreementPage = lazy(() => import("./pages/NewMaintenanceAgreementPage"));
const MaintenanceAgreementsPage = lazy(() => import("./pages/MaintenanceAgreementsPage"));
const MaintenanceAgreementDetailPage = lazy(() => import("./pages/MaintenanceAgreementDetailPage"));

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
  useAutoLogout();
  
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/public/claims/:id" element={<PublicClaimView />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/claims" element={<ProtectedRoute><ClaimsList /></ProtectedRoute>} />
      <Route path="/claims/new" element={<ProtectedRoute><ClaimsFormAdvanced /></ProtectedRoute>} />
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
      <Route path="/vedlikehold" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <MaintenancePage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/vedlikehold/avtaler" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <MaintenanceAgreementsPage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/vedlikehold/avtaler/:id" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <MaintenanceAgreementDetailPage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="/vedlikehold/avtaler/ny" element={
        <ProtectedRoute>
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <NewMaintenanceAgreementPage />
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
