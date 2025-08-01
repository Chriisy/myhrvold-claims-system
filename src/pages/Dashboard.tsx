import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp, BarChart3, Loader2, RefreshCw, AlertCircle, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useDashboardStats, useRecentClaims } from "@/hooks/useDashboardData";
import UserNav from "@/components/UserNav";
import { WelcomePopup } from "@/components/ui/welcome-popup";

const Dashboard = () => {
  const { profile } = useAuth();
  
  // Re-enable React Query hooks
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useDashboardStats();
  
  const { 
    data: recentClaims = [], 
    isLoading: claimsLoading,
    error: claimsError 
  } = useRecentClaims(5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nb-NO');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-accent/10 text-accent border-accent/20";
      case "pending_approval": return "bg-orange-100 text-orange-800 border-orange-200";
      case "under_processing": return "bg-secondary/10 text-secondary border-secondary/20";
      case "sent_supplier": return "bg-primary/10 text-primary border-primary/20";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Ny";
      case "pending_approval": return "Venter godkjenning";
      case "under_processing": return "Under behandling";
      case "sent_supplier": return "Sendt til leverandør";
      case "resolved": return "Løst";
      default: return status;
    }
  };

  // Handle loading and error states
  if (statsLoading && !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Laster dashboard...</p>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Feil ved lasting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              {statsError?.message || "Kunne ikke laste dashboard data"}
            </p>
            <Button onClick={() => refetchStats()} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Prøv igjen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WelcomePopup />
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Myhrvoldgruppen</h1>
                <p className="text-sm text-muted-foreground">Reklamasjonsbehandling</p>
              </div>
              {(statsLoading || claimsLoading) && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Link to="/analytics" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Rapporter</span>
                </Button>
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/suppliers/scorecard" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Award className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Leverandører</span>
                    <span className="sm:hidden">Scorecard</span>
                  </Button>
                </Link>
              )}
              <Link to="/claims/new" className="w-full sm:w-auto">
                <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Ny reklamasjon</span>
                  <span className="sm:hidden">Ny sak</span>
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale reklamasjoner</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClaims || 0}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.role === 'technician' 
                  ? `Avdeling ${profile?.department === 'nord_norge' ? 'Nord Norge' : 
                      profile?.department === 'kristiansand' ? 'Kristiansand' :
                      profile?.department?.charAt(0).toUpperCase() + profile?.department?.slice(1)}` 
                  : 'Totalt i systemet'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venter godkjenning</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingApproval || 0}</div>
              <p className="text-xs text-muted-foreground">Krever handling</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under behandling</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.underProcessing || 0}</div>
              <p className="text-xs text-muted-foreground">Aktive saker</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Løste saker</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
              <p className="text-xs text-muted-foreground">Fullførte saker</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total kostnad</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalCosts || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Forventet: {formatCurrency(stats?.expectedRefunds || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gj.snitt løsingstid</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageResolutionTime || 0} dager</div>
              <p className="text-xs text-muted-foreground">Fra opprettelse til løsning</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Forfalte saker</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.overdueClaimsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Over 7 dager gamle</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kritiske saker</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.urgencyStats?.critical || 0}
              </div>
              <p className="text-xs text-muted-foreground">Høy prioritet: {stats?.urgencyStats?.high || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refusjon rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.refundRate ? `${Math.round(stats.refundRate)}%` : '0%'}
              </div>
              <p className="text-xs text-muted-foreground">Mottatte vs forventede</p>
            </CardContent>
          </Card>
        </div>

        {/* Department Performance (Admin Only) */}
        {profile?.role === 'admin' && stats?.departmentStats && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Avdelings-oversikt</CardTitle>
              <CardDescription>Ytelse per avdeling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.departmentStats.map((dept) => (
                   <div key={dept.department} className="p-4 border rounded-lg">
                     <h4 className="font-medium capitalize mb-2">
                        {dept.department === 'nord_norge' ? 'Nord Norge' : 
                         dept.department === 'kristiansand' ? 'Kristiansand' :
                         dept.department === 'vestfold' ? 'Vestfold' :
                         dept.department === 'agder' ? 'Agder' :
                         dept.department === 'ekstern' ? 'Ekstern' :
                         dept.department.charAt(0).toUpperCase() + dept.department.slice(1)}
                      </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Totalt:</span>
                        <span className="font-medium">{dept.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Venter:</span>
                        <span className="text-orange-600">{dept.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Løst:</span>
                        <span className="text-green-600">{dept.resolved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Snitt kostnad:</span>
                        <span className="font-medium">{formatCurrency(dept.avgCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekly Trend Card */}
        {stats?.weeklyTrend !== undefined && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ukentlig trend</CardTitle>
              <CardDescription>Endring i antall reklamasjoner siste uke</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.weeklyTrend > 0 ? '+' : ''}{Math.round(stats.weeklyTrend)}%
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.weeklyTrend > 0 ? 'Økning' : stats.weeklyTrend < 0 ? 'Reduksjon' : 'Ingen endring'} sammenlignet med forrige uke
              </p>
            </CardContent>
          </Card>
        )}

        {/* Old performance metrics section - remove this */}
        {false && stats?.averageResolutionTime && (
          <div></div>
        )}

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Siste reklamasjoner</CardTitle>
                <CardDescription>Oversikt over nylig registrerte reklamasjoner</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetchStats()}
                  disabled={statsLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                </Button>
                <Link to="/claims">
                  <Button variant="outline">Se alle</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {claimsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : claimsError ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Feil ved lasting av reklamasjoner</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentClaims.map((claim) => (
                  <Link 
                    key={claim.id} 
                    to={`/claims/${claim.id}`}
                    className="block hover:bg-muted/50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-bold text-lg text-primary">{claim.claim_number}</p>
                          <Badge className={getStatusColor(claim.status)}>
                            {getStatusLabel(claim.status)}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">Kunde:</span> {claim.customer_name}</p>
                          <p><span className="font-medium">Produkt:</span> {claim.product_name}</p>
                          <p><span className="font-medium">Tekniker:</span> {claim.technician_name}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(claim.created_date)}
                      </div>
                    </div>
                  </Link>
                ))}
                
                {recentClaims.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Ingen reklamasjoner registrert ennå.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;