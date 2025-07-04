import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Edit, CheckCircle2, Clock, FileText, Mail } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import SendSupplierEmailDialog from "@/components/SendSupplierEmailDialog";

const ClaimDetails = () => {
  const { id } = useParams();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  // Mock data for demonstration
  const claim = {
    id: "RK-2024-001",
    status: "Under behandling",
    customer: {
      name: "Rema 1000 Stavanger",
      contactPerson: "Ola Nordmann",
      email: "ola.nordmann@rema1000.no",
      phone: "+47 123 45 678",
      address: "Storgata 1, 4001 Stavanger"
    },
    product: {
      name: "Kjøleskap Model X200",
      serialNumber: "SN123456789",
      purchaseDate: "2023-06-15",
      warranty: "2 år",
      supplier: "Electrolux"
    },
    issue: {
      type: "Mekanisk feil",
      description: "Kjøleskapet produserer unormal støy og temperaturen er ustabil. Kunden rapporterer at kompressoren lager høye lyder spesielt om natten.",
      urgency: "Høy"
    },
    technician: "Lars Hansen",
    createdDate: "2024-01-15",
    lastUpdated: "2024-01-16",
    files: [
      { name: "kjoleskap_foto1.jpg", size: "2.3 MB", type: "image" },
      { name: "garantibevis.pdf", size: "450 KB", type: "document" },
      { name: "kjoleskap_foto2.jpg", size: "1.8 MB", type: "image" }
    ],
    timeline: [
      { date: "2024-01-15 10:30", action: "Reklamasjon opprettet", user: "Lars Hansen", status: "Ny" },
      { date: "2024-01-15 14:15", action: "Reklamasjon godkjent for behandling", user: "Christopher (Admin)", status: "Under behandling" },
      { date: "2024-01-16 09:00", action: "Tekniker kontaktet leverandør", user: "Lars Hansen", status: "Under behandling" }
    ]
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/claims">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til liste
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">{claim.id}</h1>
                <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                <Badge className={getUrgencyColor(claim.issue.urgency)}>{claim.issue.urgency}</Badge>
              </div>
              <p className="text-muted-foreground">Opprettet {claim.createdDate} av {claim.technician}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Rediger
              </Button>
              <Button>
                Oppdater status
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Kundeinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{claim.customer.name}</p>
                  <p className="text-sm text-muted-foreground">Kontaktperson: {claim.customer.contactPerson}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">E-post:</p>
                    <p className="text-muted-foreground">{claim.customer.email}</p>
                  </div>
                  <div>
                    <p className="font-medium">Telefon:</p>
                    <p className="text-muted-foreground">{claim.customer.phone}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Adresse:</p>
                  <p className="text-muted-foreground">{claim.customer.address}</p>
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle>Produktinformasjon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{claim.product.name}</p>
                  <p className="text-sm text-muted-foreground">Serienummer: {claim.product.serialNumber}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Kjøpsdato:</p>
                    <p className="text-muted-foreground">{claim.product.purchaseDate}</p>
                  </div>
                  <div>
                    <p className="font-medium">Garanti:</p>
                    <p className="text-muted-foreground">{claim.product.warranty}</p>
                  </div>
                  <div>
                    <p className="font-medium">Leverandør:</p>
                    <p className="text-muted-foreground">{claim.product.supplier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Description */}
            <Card>
              <CardHeader>
                <CardTitle>Problembesk­rivelse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-sm">Type problem:</p>
                  <p className="text-muted-foreground">{claim.issue.type}</p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium text-sm">Detaljert beskrivelse:</p>
                  <p className="text-muted-foreground">{claim.issue.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Files */}
            <Card>
              <CardHeader>
                <CardTitle>Vedlegg ({claim.files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {claim.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Last ned
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tidslinje
                </CardTitle>
                <CardDescription>Historikk for denne reklamasjonen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {claim.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        {index < claim.timeline.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-muted-foreground">{event.user}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hurtighandlinger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marker som løst
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send til leverandør
                </Button>
                <Button className="w-full" variant="outline">
                  Kontakt kunde
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <SendSupplierEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        claimId={claim.id}
        supplierName={claim.product.supplier}
        defaultEmail=""
      />
    </div>
  );
};

export default ClaimDetails;