import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useClaimsPaginated } from "@/hooks/useClaimsPaginated";
import UserNav from "@/components/UserNav";

const ClaimsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { profile } = useAuth();

  // Use the new paginated hook
  const filters = useMemo(() => ({
    status: statusFilter === 'all' ? undefined : statusFilter as any,
    search: searchTerm.trim() || undefined
  }), [statusFilter, searchTerm]);

  const {
    data: claims,
    isLoading,
    isError,
    error,
    pagination,
    goToPage,
    hasNextPage,
    hasPreviousPage
  } = useClaimsPaginated(filters);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-accent/10 text-accent border-accent/20";
      case "pending_approval": return "bg-orange-100 text-orange-800 border-orange-200";
      case "under_processing": return "bg-secondary/10 text-secondary border-secondary/20";
      case "sent_supplier": return "bg-primary/10 text-primary border-primary/20";
      case "awaiting_response": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "resolved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Ny";
      case "pending_approval": return "Venter godkjenning";
      case "under_processing": return "Under behandling";
      case "sent_supplier": return "Sendt til leverandør";
      case "awaiting_response": return "Venter svar";
      case "resolved": return "Løst";
      case "rejected": return "Avvist";
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical": return "Kritisk";
      case "high": return "Høy";
      case "normal": return "Normal";
      case "low": return "Lav";
      default: return urgency;
    }
  };

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      goToPage(pagination.page + 1);
    }
  }, [hasNextPage, goToPage, pagination.page]);

  const handlePrevPage = useCallback(() => {
    if (hasPreviousPage) {
      goToPage(pagination.page - 1);
    }
  }, [hasPreviousPage, goToPage, pagination.page]);

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Feil ved lasting</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error?.message || "Kunne ikke laste reklamasjoner"}
            </p>
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
          <div className="flex items-center justify-between">
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
            <UserNav />
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
                    <SelectItem value="new">Ny</SelectItem>
                    <SelectItem value="pending_approval">Venter godkjenning</SelectItem>
                    <SelectItem value="under_processing">Under behandling</SelectItem>
                    <SelectItem value="sent_supplier">Sendt til leverandør</SelectItem>
                    <SelectItem value="awaiting_response">Venter svar</SelectItem>
                    <SelectItem value="resolved">Løst</SelectItem>
                    <SelectItem value="rejected">Avvist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Reklamasjoner ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && claims.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Laster reklamasjoner...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{claim.claim_number}</h3>
                          {claim.account_code && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {claim.account_code}
                            </span>
                          )}
                          <Badge className={getStatusColor(claim.status)}>{getStatusLabel(claim.status)}</Badge>
                          <Badge className={getUrgencyColor(claim.urgency_level)}>{getUrgencyLabel(claim.urgency_level)}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><span className="font-medium">Kunde:</span> {claim.customer_name}</p>
                          <p><span className="font-medium">Produkt:</span> {claim.product_name}</p>
                          <p><span className="font-medium">Tekniker:</span> {claim.technician_name}</p>
                          <p><span className="font-medium">Opprettet:</span> {new Date(claim.created_date).toLocaleDateString('nb-NO')}</p>
                          <p><span className="font-medium">Leverandør:</span> {claim.supplier}</p>
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
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-muted-foreground">
                      Side {pagination.page} av {pagination.totalPages} 
                      ({pagination.total} totalt)
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handlePrevPage}
                        disabled={!hasPreviousPage}
                        variant="outline"
                        size="sm"
                      >
                        Forrige
                      </Button>
                      <Button 
                        onClick={handleNextPage}
                        disabled={!hasNextPage}
                        variant="outline"
                        size="sm"
                      >
                        Neste
                      </Button>
                    </div>
                  </div>
                )}
                
                {claims.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "Ingen reklamasjoner funnet med de valgte filtrene."
                        : "Ingen reklamasjoner registrert ennå."
                      }
                    </p>
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

export default ClaimsList;