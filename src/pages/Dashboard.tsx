import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import NavHeader from "@/components/NavHeader";
import UserNav from "@/components/UserNav";

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingApproval: 0,
    underProcessing: 0,
    resolved: 0,
    totalCosts: 0,
    expectedRefunds: 0,
  });
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Build query based on user role
      let claimsQuery = supabase
        .from('claims')
        .select('*');

      if (profile?.role === 'technician') {
        // Technicians see only their department's claims
        claimsQuery = claimsQuery.eq('department', profile.department);
      }

      const { data: claims, error } = await claimsQuery.order('created_date', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const totalClaims = claims?.length || 0;
      const pendingApproval = claims?.filter(c => c.status === 'pending_approval').length || 0;
      const underProcessing = claims?.filter(c => c.status === 'under_processing').length || 0;
      const resolved = claims?.filter(c => c.status === 'resolved').length || 0;
      const totalCosts = claims?.reduce((sum, c) => sum + (c.total_cost || 0), 0) || 0;
      const expectedRefunds = claims?.reduce((sum, c) => sum + (c.expected_refund || 0), 0) || 0;

      setStats({
        totalClaims,
        pendingApproval,
        underProcessing,
        resolved,
        totalCosts,
        expectedRefunds,
      });

      setRecentClaims(claims?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
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
      case "Ny": return "bg-accent/10 text-accent border-accent/20";
      case "Under behandling": return "bg-secondary/10 text-secondary border-secondary/20";
      case "Sendt til leverandør": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-primary">Myhrvoldgruppen</h1>
                <p className="text-muted-foreground">Reklamasjonsbehandling</p>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/analytics">
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link to="/claims/new">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Ny reklamasjon
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
              <div className="text-2xl font-bold">{stats.totalClaims}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.role === 'technician' ? 'I din avdeling' : 'Totalt i systemet'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Venter godkjenning</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApproval}</div>
              <p className="text-xs text-muted-foreground">Krever handling</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under behandling</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.underProcessing}</div>
              <p className="text-xs text-muted-foreground">Aktive saker</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Løste saker</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolved}</div>
              <p className="text-xs text-muted-foreground">Fullførte saker</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total kostnad</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCosts)}</div>
              <p className="text-xs text-muted-foreground">Forventet: {formatCurrency(stats.expectedRefunds)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Siste reklamasjoner</CardTitle>
                <CardDescription>Oversikt over nylig registrerte reklamasjoner</CardDescription>
              </div>
              <Link to="/claims">
                <Button variant="outline">Se alle</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{claim.id}</p>
                      <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{claim.customer}</p>
                    <p className="text-sm text-muted-foreground">{claim.product}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {claim.date}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;