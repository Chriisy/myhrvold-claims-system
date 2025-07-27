import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Building2, UserCheck, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";

// Import components for each admin section
import UserManagement from "@/components/admin/UserManagement";
import SupplierManagement from "@/components/admin/SupplierManagement";
import CustomerManagement from "@/components/admin/CustomerManagement";
import SystemSettings from "@/components/admin/SystemSettings";

const AdminSettings = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalCustomers: 0,
    recentClaims: 0
  });

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch user stats
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, is_active');
      
      // Fetch supplier stats  
      const { data: suppliers } = await supabase
        .from('suppliers')
        .select('id, is_active');

      // Fetch customer count from unique customers in claims
      const { data: claims } = await supabase
        .from('claims')
        .select('customer_name');

      const uniqueCustomers = new Set(claims?.map(c => c.customer_name) || []);

      // Fetch recent claims (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentClaims } = await supabase
        .from('claims')
        .select('id')
        .gte('created_date', thirtyDaysAgo.toISOString());

      setStats({
        totalUsers: profiles?.length || 0,
        activeUsers: profiles?.filter(p => p.is_active).length || 0,
        totalSuppliers: suppliers?.length || 0,
        activeSuppliers: suppliers?.filter(s => s.is_active).length || 0,
        totalCustomers: uniqueCustomers.size,
        recentClaims: recentClaims?.length || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Kun for administratorer</h3>
            <p className="text-muted-foreground mb-4">
              Du må være administrator for å få tilgang til systeminnstillinger.
            </p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary">Administrator instillinger</h1>
              <p className="text-muted-foreground">Sentralisert administrasjon av brukere, leverandører og system</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              Administrator
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brukere</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} aktive brukere
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leverandører</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeSuppliers} aktive leverandører
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kunder</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                Registrerte kunder
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivitet</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentClaims}</div>
              <p className="text-xs text-muted-foreground">
                Reklamasjoner siste 30 dager
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Brukere
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Leverandører
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Kunder
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <UserManagement onStatsUpdate={fetchAdminStats} />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SupplierManagement onStatsUpdate={fetchAdminStats} />
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <CustomerManagement onStatsUpdate={fetchAdminStats} />
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;