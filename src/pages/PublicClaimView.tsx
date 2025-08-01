import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface ClaimData {
  id: string;
  claim_number: string;
  status: string;
  created_date: string;
  updated_date: string;
  customer_name: string;
  product_name: string;
  product_model: string;
  serial_number: string;
  supplier: string;
  issue_description: string;
  technician_name: string;
  expected_refund: number;
  actual_refund: number;
  refund_status: string;
  total_cost: number;
  total_refunded: number;
  net_cost: number;
}

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  pending_approval: "bg-yellow-100 text-yellow-800", 
  under_processing: "bg-orange-100 text-orange-800",
  sent_supplier: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800"
};

const statusLabels = {
  new: "Ny",
  pending_approval: "Venter på godkjenning",
  under_processing: "Under behandling", 
  sent_supplier: "Sendt til leverandør",
  resolved: "Løst"
};

const refundStatusLabels = {
  pending: "Venter",
  partial: "Delvis refundert",
  completed: "Fullført",
  rejected: "Avvist",
  received: "Mottatt"
};

export default function PublicClaimView() {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<ClaimData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClaim = async () => {
      if (!id) return;
      
      try {
        // Fetch claim without authentication - this will work if we make the table publicly readable
        const { data, error } = await supabase
          .from('claims')
          .select(`
            id,
            claim_number,
            status,
            created_date,
            updated_date,
            customer_name,
            product_name,
            product_model,
            serial_number,
            supplier,
            issue_description,
            technician_name,
            expected_refund,
            actual_refund,
            refund_status,
            total_cost,
            total_refunded,
            net_cost
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching claim:', error);
          setError('Kunne ikke hente reklamasjonsinformasjon');
          return;
        }

        if (!data) {
          setError('Reklamasjon ikke funnet');
          return;
        }

        setClaim(data);
      } catch (err) {
        console.error('Error:', err);
        setError('En feil oppstod');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', { 
      style: 'currency', 
      currency: 'NOK' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Laster reklamasjonsinformasjon...</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Feil</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Reklamasjon ikke funnet'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-primary">Reklamasjonsstatus</h1>
            <Badge 
              className={`${statusColors[claim.status as keyof typeof statusColors]} border-0`}
            >
              {statusLabels[claim.status as keyof typeof statusLabels]}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Reklamasjonsnummer: <span className="font-medium">{claim.claim_number}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Opprettet: {formatDate(claim.created_date)} • 
            Sist oppdatert: {formatDate(claim.updated_date)}
          </p>
        </div>

        <div className="grid gap-6">
          {/* Customer and Product Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kundeinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Kunde:</span>
                  <p className="text-sm text-muted-foreground">{claim.customer_name}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Produktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Produkt:</span>
                  <p className="text-sm text-muted-foreground">{claim.product_name}</p>
                </div>
                {claim.product_model && (
                  <div>
                    <span className="text-sm font-medium">Modell:</span>
                    <p className="text-sm text-muted-foreground">{claim.product_model}</p>
                  </div>
                )}
                {claim.serial_number && (
                  <div>
                    <span className="text-sm font-medium">Serienummer:</span>
                    <p className="text-sm text-muted-foreground">{claim.serial_number}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium">Leverandør:</span>
                  <p className="text-sm text-muted-foreground">{claim.supplier}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problembeskrivelse</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{claim.issue_description}</p>
              <Separator className="my-3" />
              <div>
                <span className="text-sm font-medium">Tekniker:</span>
                <p className="text-sm text-muted-foreground">{claim.technician_name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Economic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Økonomisk informasjon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium">Total kostnad:</span>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(claim.total_cost || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Total refundert:</span>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(claim.total_refunded || 0)}
                  </p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium">Netto kostnad:</span>
                  <p className="text-lg font-semibold">
                    {formatCurrency(claim.net_cost || 0)}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Refund Information */}
              <div className="space-y-3">
                <h4 className="font-medium">Refusjon</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium">Forventet refusjon:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(claim.expected_refund || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Faktisk refusjon:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(claim.actual_refund || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Status:</span>
                    <p className="text-sm text-muted-foreground">
                      {refundStatusLabels[claim.refund_status as keyof typeof refundStatusLabels] || claim.refund_status}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Myhrvold Gruppen - Reklamasjonshåndtering</p>
          <p>For spørsmål, kontakt oss på support@myhrvold.no</p>
        </div>
      </div>
    </div>
  );
}