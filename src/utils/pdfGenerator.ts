import jsPDF from 'jspdf';

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

const formatDate = (dateString: string | null | undefined, language: 'no' | 'en') => {
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

export const generateClaimPDF = (claim: ClaimData, language: 'no' | 'en') => {
  const doc = new jsPDF();
  let yPosition = 20;

  // Helper function to add text and move position
  const addText = (text: string, x: number = 20, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    // Handle long text by splitting it
    const splitText = doc.splitTextToSize(text, 170);
    doc.text(splitText, x, yPosition);
    yPosition += splitText.length * (fontSize * 0.5) + 5;
    
    return yPosition;
  };

  const addSection = (title: string) => {
    yPosition += 5;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition - 8, 170, 12, 'F');
    addText(title, 22, 12, true);
    yPosition += 2;
  };

  // Title
  const title = language === 'no' 
    ? `Reklamasjonssak - ${claim.claim_number}`
    : `Warranty Claim - ${claim.claim_number}`;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, yPosition);
  yPosition += 15;

  // Product Information
  addSection(language === 'no' ? 'Produktinformasjon' : 'Product Information');
  addText(`${language === 'no' ? 'Produkt' : 'Product'}: ${claim.product_name}`);
  if (claim.product_model) {
    addText(`${language === 'no' ? 'Modell' : 'Model'}: ${claim.product_model}`);
  }
  if (claim.serial_number) {
    addText(`${language === 'no' ? 'Serienummer' : 'Serial Number'}: ${claim.serial_number}`);
  }
  if (claim.purchase_date) {
    addText(`${language === 'no' ? 'Kjøpsdato' : 'Purchase Date'}: ${formatDate(claim.purchase_date, language)}`);
  }
  if (claim.warranty_period) {
    addText(`${language === 'no' ? 'Garantiperiode' : 'Warranty Period'}: ${claim.warranty_period}`);
  }

  // Issue Description
  addSection(language === 'no' ? 'Feilbeskrivelse' : 'Issue Description');
  addText(claim.issue_description);
  if (claim.detailed_description) {
    addText(`${language === 'no' ? 'Detaljert beskrivelse' : 'Detailed Description'}: ${claim.detailed_description}`);
  }

  // Customer Information
  addSection(language === 'no' ? 'Kundeinformasjon' : 'Customer Information');
  addText(`${language === 'no' ? 'Kunde' : 'Customer'}: ${claim.customer_name}`);
  if (claim.customer_contact) {
    addText(`${language === 'no' ? 'Kontaktperson' : 'Contact Person'}: ${claim.customer_contact}`);
  }
  if (claim.customer_email) {
    addText(`${language === 'no' ? 'E-post' : 'Email'}: ${claim.customer_email}`);
  }
  if (claim.customer_phone) {
    addText(`${language === 'no' ? 'Telefon' : 'Phone'}: ${claim.customer_phone}`);
  }
  if (claim.customer_address) {
    addText(`${language === 'no' ? 'Adresse' : 'Address'}: ${claim.customer_address}`);
  }

  // Work Performed
  addSection(language === 'no' ? 'Utført arbeid' : 'Work Performed');
  addText(`${language === 'no' ? 'Tekniker' : 'Technician'}: ${claim.technician_name}`);
  if (claim.work_hours) {
    const workCost = (claim.work_hours || 0) * (claim.hourly_rate || 0);
    addText(`${language === 'no' ? 'Arbeidstimer' : 'Work Hours'}: ${claim.work_hours} ${language === 'no' ? 'timer' : 'hours'} (${formatCurrency(workCost)})`);
  }
  if (claim.travel_hours) {
    addText(`${language === 'no' ? 'Reisetid' : 'Travel Time'}: ${claim.travel_hours} ${language === 'no' ? 'timer' : 'hours'}`);
  }
  if (claim.travel_distance_km) {
    const travelCost = (claim.travel_distance_km || 0) * (claim.vehicle_cost_per_km || 0);
    addText(`${language === 'no' ? 'Reiseavstand' : 'Travel Distance'}: ${claim.travel_distance_km} km (${formatCurrency(travelCost)})`);
  }
  if (claim.parts_cost) {
    addText(`${language === 'no' ? 'Delekostnad' : 'Parts Cost'}: ${formatCurrency(claim.parts_cost)}`);
  }
  if (claim.consumables_cost) {
    addText(`${language === 'no' ? 'Forbruksmateriell' : 'Consumables'}: ${formatCurrency(claim.consumables_cost)}`);
  }
  if (claim.external_services_cost) {
    addText(`${language === 'no' ? 'Eksterne tjenester' : 'External Services'}: ${formatCurrency(claim.external_services_cost)}`);
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Cost Summary
  addSection(language === 'no' ? 'Kostnadsoversikt' : 'Cost Summary');
  addText(`${language === 'no' ? 'Total kostnad' : 'Total Cost'}: ${formatCurrency(claim.total_cost)}`);
  addText(`${language === 'no' ? 'Forventet refusjon' : 'Expected Refund'}: ${formatCurrency(claim.expected_refund)}`);

  // Supplier Notes
  if (claim.supplier_notes) {
    addSection(language === 'no' ? 'Leverandørnotater' : 'Supplier Notes');
    addText(claim.supplier_notes);
  }

  // Footer
  yPosition += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  
  const footerText = language === 'no'
    ? `Denne PDF-en er generert automatisk fra vårt reklamasjonssystem.
Reklamasjonsnummer: ${claim.claim_number}
Generert: ${new Date().toLocaleDateString('nb-NO')}`
    : `This PDF was generated automatically from our warranty claim system.
Claim Number: ${claim.claim_number}
Generated: ${new Date().toLocaleDateString('en-GB')}`;

  doc.text(footerText, 20, yPosition);

  // Download the PDF
  const fileName = `reklamasjon-${claim.claim_number}-${language}.pdf`;
  doc.save(fileName);
};