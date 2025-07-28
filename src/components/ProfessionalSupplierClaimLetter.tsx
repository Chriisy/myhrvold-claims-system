import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Download, Mail } from "lucide-react";

interface ClaimData {
  id: string;
  claim_number: string;
  status: string;
  customer_name: string;
  customer_contact?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  product_name: string;
  product_model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_period?: string;
  supplier: string;
  issue_description: string;
  detailed_description?: string;
  technician_name: string;
  work_hours?: number;
  hourly_rate?: number;
  travel_hours?: number;
  travel_distance_km?: number;
  vehicle_cost_per_km?: number;
  parts_cost?: number;
  consumables_cost?: number;
  external_services_cost?: number;
  total_cost?: number;
  expected_refund?: number;
  supplier_notes?: string;
  created_date: string;
}

interface ProfessionalSupplierClaimLetterProps {
  claim: ClaimData;
  language?: 'no' | 'en';
}

const formatDate = (dateString: string | null | undefined, language: 'no' | 'en' = 'no') => {
  if (!dateString) return language === 'no' ? 'Ikke oppgitt' : 'Not specified';
  return new Date(dateString).toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');
};

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return '0,00 kr';
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK'
  }).format(amount);
};

const translations = {
  no: {
    subject: 'Garantikrav - Krav om refusjon',
    greeting: 'Til',
    intro: 'Vi viser til garantiavtalen mellom våre bedrifter og ønsker herved å fremsette krav om refusjon for utført garantiarbeid.',
    claimInfo: 'Kravinformasjon',
    claimNumber: 'Kravinummer',
    claimDate: 'Kravdato',
    productInfo: 'Produktinformasjon',
    product: 'Produkt',
    model: 'Modell',
    serialNumber: 'Serienummer',
    purchaseDate: 'Kjøpsdato',
    warranty: 'Garantiperiode',
    issueTitle: 'Beskrivelse av feil og utført arbeid',
    issue: 'Registrert feil',
    workDescription: 'Utført arbeid',
    technician: 'Tekniker',
    costBreakdown: 'Kostnadssammenbrudd',
    laborCosts: 'Arbeidskostnader',
    partsCosts: 'Delekostnader',
    travelCosts: 'Reisekostnader',
    totalCost: 'Totalkostnad',
    refundRequest: 'Krav om refusjon',
    documentation: 'Dokumentasjon',
    docText: 'Alle relevante dokumenter, kvitteringer og bilder er vedlagt dette kravet.',
    resolution: 'Ønsket løsning',
    resolutionText: 'Vi krever full refusjon av kostnadene i henhold til garantiavtalen. Vi ber om svar innen 14 dager.',
    closing: 'Vi ser frem til en rask avklaring av denne saken.',
    regards: 'Med vennlig hilsen',
    companyName: 'MYHRVOLD GRUPPEN',
    subtitle: 'Profesjonell Service & Support',
    footer: 'Dette dokumentet er sendt digitalt og krever ikke underskrift.',
    year: 'år'
  },
  en: {
    subject: 'Warranty Claim - Refund Request',
    greeting: 'To',
    intro: 'We refer to the warranty agreement between our companies and hereby submit a claim for refund of warranty work performed.',
    claimInfo: 'Claim Information',
    claimNumber: 'Claim Number',
    claimDate: 'Claim Date',
    productInfo: 'Product Information',
    product: 'Product',
    model: 'Model',
    serialNumber: 'Serial Number',
    purchaseDate: 'Purchase Date',
    warranty: 'Warranty Period',
    issueTitle: 'Description of Issue and Work Performed',
    issue: 'Reported Issue',
    workDescription: 'Work Performed',
    technician: 'Technician',
    costBreakdown: 'Cost Breakdown',
    laborCosts: 'Labor Costs',
    partsCosts: 'Parts Costs',
    travelCosts: 'Travel Costs',
    totalCost: 'Total Cost',
    refundRequest: 'Refund Request',
    documentation: 'Documentation',
    docText: 'All relevant documents, receipts and images are attached to this claim.',
    resolution: 'Requested Resolution',
    resolutionText: 'We request full refund of the costs according to the warranty agreement. We ask for a response within 14 days.',
    closing: 'We look forward to a quick resolution of this matter.',
    regards: 'Best regards',
    companyName: 'MYHRVOLD GRUPPEN',
    subtitle: 'Professional Service & Support',
    footer: 'This document is sent digitally and does not require signature.',
    year: 'year'
  }
};

export function ProfessionalSupplierClaimLetter({ claim, language = 'no' }: ProfessionalSupplierClaimLetterProps) {
  const t = translations[language];
  const currentDate = new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');

  const handlePrint = () => {
    window.print();
  };

  const generateEmailBody = () => {
    const emailBody = `${t.greeting} ${claim.supplier},

${t.intro}

${t.claimNumber}: ${claim.claim_number}
${t.product}: ${claim.product_name}
${claim.product_model ? `${t.model}: ${claim.product_model}` : ''}
${claim.serial_number ? `${t.serialNumber}: ${claim.serial_number}` : ''}

${t.issue}: ${claim.issue_description}
${claim.detailed_description ? `${t.workDescription}: ${claim.detailed_description}` : ''}

${t.totalCost}: ${formatCurrency(claim.total_cost)}

${t.resolutionText}

${t.closing}

${t.regards}
${t.companyName}`;

    const subject = `${t.subject} - ${claim.claim_number}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="max-w-4xl mx-auto bg-background">
      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Skriv ut / Lagre som PDF
        </Button>
        <Button variant="outline" onClick={generateEmailBody} className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Send som e-post
        </Button>
      </div>

      {/* Letter Content */}
      <Card className="shadow-lg border-0 print:shadow-none">
        <CardContent className="p-0">
          {/* Header with professional gradient */}
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 text-center">
            <h1 className="text-4xl font-bold tracking-wider mb-2">{t.companyName}</h1>
            <p className="text-lg opacity-90">{t.subtitle}</p>
          </div>

          {/* Letter Body */}
          <div className="p-8 space-y-8">
            {/* Header Info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Dato / Date:</p>
                <p className="font-medium">{currentDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t.claimNumber}:</p>
                <p className="font-bold text-primary text-lg">{claim.claim_number}</p>
              </div>
            </div>

            {/* Recipient */}
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t.greeting}:</p>
              <p className="font-semibold text-lg">{claim.supplier}</p>
            </div>

            <Separator />

            {/* Subject */}
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-primary">{t.subject}</h2>
            </div>

            {/* Introduction */}
            <p className="text-foreground leading-relaxed">{t.intro}</p>

            {/* Product Information */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                {t.productInfo}
              </h3>
              <div className="grid grid-cols-2 gap-4 pl-5">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">{t.product.toUpperCase()}</p>
                  <p className="font-semibold">{claim.product_name}</p>
                </div>
                {claim.product_model && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">{t.model.toUpperCase()}</p>
                    <p className="font-semibold">{claim.product_model}</p>
                  </div>
                )}
                {claim.serial_number && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">{t.serialNumber.toUpperCase()}</p>
                    <p className="font-semibold">{claim.serial_number}</p>
                  </div>
                )}
                {claim.purchase_date && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">{t.purchaseDate.toUpperCase()}</p>
                    <p className="font-semibold">{formatDate(claim.purchase_date, language)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                {t.issueTitle}
              </h3>
              <div className="pl-5 space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t.issue.toUpperCase()}</p>
                  <p className="leading-relaxed">{claim.issue_description}</p>
                </div>
                {claim.detailed_description && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t.workDescription.toUpperCase()}</p>
                    <p className="leading-relaxed">{claim.detailed_description}</p>
                  </div>
                )}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t.technician.toUpperCase()}</p>
                  <p className="font-semibold">{claim.technician_name}</p>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                {t.refundRequest}
              </h3>
              <div className="pl-5">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">{t.totalCost.toUpperCase()}</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(claim.total_cost)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                {t.documentation}
              </h3>
              <p className="pl-5 text-foreground leading-relaxed">{t.docText}</p>
            </div>

            {/* Resolution Request */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
                <div className="w-2 h-6 bg-primary rounded-full mr-3"></div>
                {t.resolution}
              </h3>
              <p className="pl-5 text-foreground leading-relaxed font-medium">{t.resolutionText}</p>
            </div>

            <Separator />

            {/* Closing */}
            <div className="space-y-4">
              <p className="text-foreground leading-relaxed">{t.closing}</p>
              
              <div className="pt-8">
                <p className="font-medium">{t.regards}</p>
                <div className="mt-4">
                  <p className="text-xl font-bold text-primary">{t.companyName}</p>
                  <p className="text-muted-foreground">{t.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground text-center italic">{t.footer}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}