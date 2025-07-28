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
      <div className="bg-white border border-gray-200 print:border-0">
        {/* Simple Header */}
        <div className="bg-slate-700 text-white p-6 text-center">
          <h1 className="text-2xl font-bold">{t.companyName}</h1>
          <p className="text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Letter Body */}
        <div className="p-8 space-y-6">
          {/* Header Info */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Dato</p>
              <p className="font-medium">{currentDate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase">{t.claimNumber}</p>
              <p className="font-bold text-lg">{claim.claim_number}</p>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-1">{t.greeting}</p>
            <p className="font-semibold text-lg">{claim.supplier}</p>
          </div>

          {/* Subject */}
          <div className="text-center py-4 border-y">
            <h2 className="text-xl font-bold">{t.subject}</h2>
          </div>

          {/* Introduction */}
          <p className="leading-relaxed">{t.intro}</p>

          {/* Product Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{t.productInfo}</h3>
            <div className="space-y-3">
              <div className="flex">
                <span className="text-xs text-gray-500 uppercase w-32">{t.product}</span>
                <span className="font-medium">{claim.product_name}</span>
              </div>
              {claim.product_model && (
                <div className="flex">
                  <span className="text-xs text-gray-500 uppercase w-32">{t.model}</span>
                  <span className="font-medium">{claim.product_model}</span>
                </div>
              )}
              {claim.serial_number && (
                <div className="flex">
                  <span className="text-xs text-gray-500 uppercase w-32">{t.serialNumber}</span>
                  <span className="font-medium">{claim.serial_number}</span>
                </div>
              )}
              {claim.purchase_date && (
                <div className="flex">
                  <span className="text-xs text-gray-500 uppercase w-32">{t.purchaseDate}</span>
                  <span className="font-medium">{formatDate(claim.purchase_date, language)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{t.issueTitle}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">{t.issue}</p>
                <p className="leading-relaxed">{claim.issue_description}</p>
              </div>
              {claim.detailed_description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-2">{t.workDescription}</p>
                  <p className="leading-relaxed">{claim.detailed_description}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">{t.technician}</p>
                <p className="font-medium">{claim.technician_name}</p>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{t.refundRequest}</h3>
            <div className="bg-gray-50 border rounded p-6 text-center">
              <p className="text-xs text-gray-500 uppercase mb-2">{t.totalCost}</p>
              <p className="text-2xl font-bold">{formatCurrency(claim.total_cost)}</p>
            </div>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{t.documentation}</h3>
            <p className="leading-relaxed">{t.docText}</p>
          </div>

          {/* Resolution Request */}
          <div>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">{t.resolution}</h3>
            <p className="leading-relaxed font-medium">{t.resolutionText}</p>
          </div>

          {/* Closing */}
          <div className="space-y-4 pt-6 border-t">
            <p className="leading-relaxed">{t.closing}</p>
            
            <div className="pt-6">
              <p className="font-medium">{t.regards}</p>
              <div className="mt-4">
                <p className="text-lg font-bold">{t.companyName}</p>
                <p className="text-gray-600">{t.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t text-center">
            <p className="text-xs text-gray-500 italic">{t.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}