import jsPDF from 'jspdf';

export interface ClaimData {
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
  custom_line_items?: any[];
}

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
    
    footer: 'Dette dokumentet er sendt digitalt og krever ikke underskrift.',
    year: 'år',
    partNumber: 'Delenr',
    description: 'Beskrivelse',
    quantity: 'Antall',
    sparePartsUsed: 'Reservedeler brukt'
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
    
    footer: 'This document is sent digitally and does not require signature.',
    year: 'year',
    partNumber: 'Part Number',
    description: 'Description',
    quantity: 'Quantity',
    sparePartsUsed: 'Spare Parts Used'
  }
};

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

// Helper function to split text into multiple lines
const splitTextToLines = (doc: jsPDF, text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const lineWidth = doc.getTextWidth(testLine);
    
    if (lineWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

export const generateClaimPDF = (claim: ClaimData, language: 'no' | 'en') => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const t = translations[language];
  let yPosition = 30;

  // Clean header
  doc.setFillColor(71, 85, 105); // slate-700
  doc.rect(0, 0, 210, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('MYHRVOLD GRUPPEN', 105, 17, { align: 'center' });

  // Document title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  yPosition = 35;
  doc.text(`${t.subject} - ${claim.claim_number}`, 105, yPosition, { align: 'center' });

  yPosition += 15;

  // Product Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(t.productInfo, 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Product fields with consistent spacing
  const labelWidth = 70; // Fixed width for all labels
  
  doc.setFont('helvetica', 'bold');
  doc.text(`${t.product}:`, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.product_name, labelWidth, yPosition);
  yPosition += 5;

  if (claim.product_model) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.model}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(claim.product_model, labelWidth, yPosition);
    yPosition += 5;
  }

  if (claim.serial_number) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.serialNumber}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(claim.serial_number, labelWidth, yPosition);
    yPosition += 5;
  }

  if (claim.purchase_date) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.purchaseDate}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(claim.purchase_date, language), labelWidth, yPosition);
    yPosition += 5;
  }

  if (claim.warranty_period) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.warranty}:`, 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${claim.warranty_period} ${t.year}`, labelWidth, yPosition);
    yPosition += 5;
  }

  yPosition += 12;

  // Issue Description
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Issue Description', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(claim.issue_description, 20, yPosition);
  yPosition += 5;

  if (claim.detailed_description) {
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Description: ', 20, yPosition);
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    const maxWidth = 170; // Max width for text
    const lines = splitTextToLines(doc, claim.detailed_description, maxWidth);
    
    lines.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 4;
    });
    yPosition += 3;
  }

  yPosition += 8;

  // Customer Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const customerLabelWidth = doc.getTextWidth('Customer: ');
  doc.text('Customer: ', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.customer_name, 20 + customerLabelWidth, yPosition);
  yPosition += 5;

  if (claim.customer_address) {
    doc.setFont('helvetica', 'bold');
    const addressLabelWidth = doc.getTextWidth('Address: ');
    doc.text('Address: ', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(claim.customer_address, 20 + addressLabelWidth, yPosition);
    yPosition += 5;
  }

  yPosition += 8;

  // Work Performed
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Work Performed', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const technicianLabelWidth = doc.getTextWidth(`${t.technician}: `);
  doc.text(`${t.technician}: `, 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(claim.technician_name, 20 + technicianLabelWidth, yPosition);
  yPosition += 5;

  // Spare parts details (without prices)
  const customLineItems = claim.custom_line_items ? 
    (Array.isArray(claim.custom_line_items) ? claim.custom_line_items : 
     (typeof claim.custom_line_items === 'string' ? JSON.parse(claim.custom_line_items) : [])) : [];
  
  if (customLineItems.length > 0) {
    yPosition += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.sparePartsUsed}:`, 20, yPosition);
    yPosition += 6;
    
    customLineItems.forEach((item: any, index: number) => {
      // Part number and quantity on the same line
      doc.setFont('helvetica', 'normal');
      doc.text(`${t.partNumber}: ${item.partNumber || 'N/A'}`, 25, yPosition);
      doc.text(`${t.quantity}: ${item.quantity || 1}`, 120, yPosition);
      yPosition += 4;
      
      // Description with text wrapping
      if (item.description) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${t.description}:`, 25, yPosition);
        doc.setFont('helvetica', 'normal');
        
        // Add proper space after colon
        const descWidth = doc.getTextWidth(`${t.description}: `);
        const availableWidth = 160 - descWidth;
        const descLines = splitTextToLines(doc, item.description, availableWidth);
        
        if (descLines[0] && doc.getTextWidth(descLines[0]) <= availableWidth) {
          // First line fits on same line as label
          doc.text(descLines[0], 25 + descWidth, yPosition);
          yPosition += 4;
          
          // Remaining lines indented
          for (let i = 1; i < descLines.length; i++) {
            doc.text(descLines[i], 30, yPosition);
            yPosition += 4;
          }
        } else {
          // Description too long, put on next line
          yPosition += 4;
          descLines.forEach(line => {
            doc.text(line, 30, yPosition);
            yPosition += 4;
          });
        }
      }
      yPosition += 4;
    });
    
    yPosition += 3;
  }

  yPosition += 8;

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('This PDF was generated automatically from our warranty claim system.', 20, yPosition);
  yPosition += 5;
  doc.text(`Claim Number: ${claim.claim_number}`, 20, yPosition);
  yPosition += 5;
  doc.text(`Generated: ${new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB')}`, 20, yPosition);

  // Save the PDF
  const filename = language === 'no' 
    ? `garantikrav_${claim.claim_number}_NO.pdf`
    : `warranty_claim_${claim.claim_number}_EN.pdf`;
  doc.save(filename);
};