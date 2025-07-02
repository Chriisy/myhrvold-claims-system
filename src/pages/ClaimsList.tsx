import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for demonstration
  const claims = [
    {
      id: "RK-2024-001",
      customer: "Rema 1000 Stavanger",
      product: "Kjøleskap Model X200",
      status: "Ny",
      date: "2024-01-15",
      technician: "Lars Hansen",
      urgency: "Høy"
    },
    {
      id: "RK-2024-002",
      customer: "ICA Maxi Bergen",
      product: "Fryser Model F100",
      status: "Under behandling",
      date: "2024-01-14",
      technician: "Kari Olsen",
      urgency: "Middels"
    },
    {
      id: "RK-2024-003",
      customer: "Coop Extra Oslo",
      product: "Kaffemaskin Pro",
      status: "Sendt til leverandør",
      date: "2024-01-13",
      technician: "Erik Nordahl",
      urgency: "Lav"
    },
    {
      id: "RK-2024-004",
      customer: "Meny Trondheim",
      product: "Kjøledisk Model K500",
      status: "Løst",
      date: "2024-01-12",
      technician: "Anne Bakken",
      urgency: "Kritisk"
    },
    {
      id: "RK-2024-005",
      customer: "Bunnpris Kristiansand",
      product: "Fryserom System",
      status: "Under behandling",
      date: "2024-01-11",
      technician: "Ole Svendsen",
      urgency: "Høy"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ny": return "bg-accent/10 text-accent border-accent/20";
      case "Under behandling": return "bg-secondary/10 text-secondary border-secondary/20";
      case "Sendt til leverandør": return "bg-primary/10 text-primary border-primary/20";
      case "Løst": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Kritisk": return "bg-red-100 text-red-800 border-red-200";
      case "Høy": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Middels": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Lav": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <div>
              <h1 className="text-2xl font-bold text-primary">Alle reklamasjoner</h1>
              <p className="text-muted-foreground">Oversikt over alle registrerte reklamasjoner</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrer og søk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Søk etter reklamasjonsnummer, kunde eller produkt..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer etter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statuser</SelectItem>
                    <SelectItem value="Ny">Ny</SelectItem>
                    <SelectItem value="Under behandling">Under behandling</SelectItem>
                    <SelectItem value="Sendt til leverandør">Sendt til leverandør</SelectItem>
                    <SelectItem value="Løst">Løst</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Reklamasjoner ({filteredClaims.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{claim.id}</h3>
                        <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                        <Badge className={getUrgencyColor(claim.urgency)}>{claim.urgency}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium">Kunde:</span> {claim.customer}</p>
                        <p><span className="font-medium">Produkt:</span> {claim.product}</p>
                        <p><span className="font-medium">Tekniker:</span> {claim.technician}</p>
                        <p><span className="font-medium">Dato:</span> {claim.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/claims/${claim.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Se detaljer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredClaims.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Ingen reklamasjoner funnet med de valgte filtrene.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClaimsList;