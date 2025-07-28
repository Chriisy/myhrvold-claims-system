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
  custom_line_items?: any[];
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

      {/* Simple Document */}
      <div className="bg-white border border-gray-200 print:border-0 p-12 space-y-8">
        {/* Document Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t.subject} - {claim.claim_number}</h1>
        </div>

        {/* Product Information */}
        <div>
          <h2 className="text-lg font-bold mb-4">{t.productInfo}</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t.product}:</span> {claim.product_name}
            </div>
            {claim.product_model && (
              <div>
                <span className="font-medium">{t.model}:</span> {claim.product_model}
              </div>
            )}
            {claim.serial_number && (
              <div>
                <span className="font-medium">{t.serialNumber}:</span> {claim.serial_number}
              </div>
            )}
            {claim.purchase_date && (
              <div>
                <span className="font-medium">{t.purchaseDate}:</span> {formatDate(claim.purchase_date, language)}
              </div>
            )}
            {claim.warranty_period && (
              <div>
                <span className="font-medium">{t.warranty}:</span> {claim.warranty_period} {t.year}
              </div>
            )}
          </div>
        </div>

        {/* Issue Description */}
        <div>
          <h2 className="text-lg font-bold mb-4">Issue Description</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">{claim.issue_description}</span>
            </div>
            {claim.detailed_description && (
              <div>
                <span className="font-medium">Detailed Description:</span> {claim.detailed_description}
              </div>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h2 className="text-lg font-bold mb-4">Customer Information</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Customer:</span> {claim.customer_name}
            </div>
            {claim.customer_address && (
              <div>
                <span className="font-medium">Address:</span> {claim.customer_address}
              </div>
            )}
          </div>
        </div>

        {/* Work Performed */}
        <div>
          <h2 className="text-lg font-bold mb-4">Work Performed</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t.technician}:</span> {claim.technician_name}
            </div>
            
            {/* Spare parts details */}
            {(() => {
              const customLineItems = claim.custom_line_items ? 
                (Array.isArray(claim.custom_line_items) ? claim.custom_line_items : 
                 (typeof claim.custom_line_items === 'string' ? JSON.parse(claim.custom_line_items) : [])) : [];
              
              return customLineItems.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium">Spare Parts Used:</span>
                  <ul className="ml-4 mt-2">
                    {customLineItems.map((item: any, index: number) => (
                      <li key={index} className="mb-1">
                        • {item.description || item.partNumber || 'Unknown part'}
                        {item.quantity && item.unitPrice && (
                          <span className="ml-2 text-sm text-gray-600">
                            Qty: {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
            
            {claim.parts_cost && (
              <div>
                <span className="font-medium">Total Parts Cost:</span> {formatCurrency(claim.parts_cost)}
              </div>
            )}
          </div>
        </div>

        {/* Cost Summary */}
        <div>
          <h2 className="text-lg font-bold mb-4">Cost Summary</h2>
          <div className="space-y-2">
            <div>
              <span className="font-medium">{t.totalCost}:</span> {formatCurrency(claim.total_cost)}
            </div>
            <div>
              <span className="font-medium">Expected Refund:</span> {formatCurrency(claim.expected_refund || 0)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-8 border-t text-xs text-gray-500 space-y-1">
          <p>This PDF was generated automatically from our warranty claim system.</p>
          <p>Claim Number: {claim.claim_number}</p>
          <p>Generated: {currentDate}</p>
        </div>
      </div>
    </div>
  );
}