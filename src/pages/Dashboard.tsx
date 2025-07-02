import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data for demonstration
  const stats = [
    { title: "Nye krav", count: 12, icon: AlertCircle, color: "text-accent" },
    { title: "Under behandling", count: 45, icon: Clock, color: "text-secondary" },
    { title: "Sendt til leverandør", count: 23, icon: FileText, color: "text-primary" },
    { title: "Løst", count: 156, icon: CheckCircle2, color: "text-green-600" },
  ];

  const recentClaims = [
    { id: "RK-2024-001", customer: "Rema 1000 Stavanger", product: "Kjøleskap Model X200", status: "Ny", date: "2024-01-15" },
    { id: "RK-2024-002", customer: "ICA Maxi Bergen", product: "Fryser Model F100", status: "Under behandling", date: "2024-01-14" },
    { id: "RK-2024-003", customer: "Coop Extra Oslo", product: "Kaffemaskin Pro", status: "Sendt til leverandør", date: "2024-01-13" },
  ];

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
            <Link to="/claims/new">
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Ny reklamasjon
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.count}</div>
              </CardContent>
            </Card>
          ))}
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