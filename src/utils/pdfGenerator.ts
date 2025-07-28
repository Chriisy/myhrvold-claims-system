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

// Eksakte oversettelser som spesifisert
const translations = {
  no: {
    subtitle: "Profesjonell Service & Support",
    claimTitle: "Garantiskrav",
    status: "Under behandling",
    productInfo: "Produktinformasjon",
    product: "PRODUKT",
    model: "MODELL",
    serialNumber: "SERIENUMMER",
    purchaseDate: "KJØPSDATO",
    warrantyPeriod: "GARANTIPERIODE",
    issueDescription: "Feilbeskrivelse",
    problem: "PROBLEM",
    detailedDescription: "DETALJERT BESKRIVELSE",
    customerInfo: "Kundeinformasjon",
    customer: "KUNDE",
    address: "ADRESSE",
    workPerformed: "Utført arbeid",
    technician: "TEKNIKER",
    partsCost: "DELER KOSTNAD",
    costSummary: "Kostnadssammendrag",
    totalCost: "Total kostnad:",
    expectedRefund: "Forventet refusjon:",
    footerText1: "Dette dokumentet er generert automatisk fra vårt garantisystem.",
    footerText2: "Krav nummer",
    footerText3: "Generert",
    footerText4: "Din partner for profesjonell service",
    year: "år"
  },
  en: {
    subtitle: "Professional Service & Support",
    claimTitle: "Warranty Claim",
    status: "Under Review",
    productInfo: "Product Information",
    product: "PRODUCT",
    model: "MODEL",
    serialNumber: "SERIAL NUMBER",
    purchaseDate: "PURCHASE DATE",
    warrantyPeriod: "WARRANTY PERIOD",
    issueDescription: "Issue Description",
    problem: "PROBLEM",
    detailedDescription: "DETAILED DESCRIPTION",
    customerInfo: "Customer Information",
    customer: "CUSTOMER",
    address: "ADDRESS",
    workPerformed: "Work Performed",
    technician: "TECHNICIAN",
    partsCost: "PARTS COST",
    costSummary: "Cost Summary",
    totalCost: "Total Cost:",
    expectedRefund: "Expected Refund:",
    footerText1: "This document was generated automatically from our warranty system.",
    footerText2: "Claim Number",
    footerText3: "Generated",
    footerText4: "Your partner for professional service",
    year: "year"
  }
};

// Eksakte hex farger konvertert til RGB
const colors = {
  primaryBlue: [30, 58, 95],      // #1e3a5f
  gradientBlue: [44, 90, 160],    // #2c5aa0
  white: [255, 255, 255],         // #ffffff
  sectionBg: [248, 249, 250],     // #f8f9fa
  labelText: [30, 58, 95],        // #1e3a5f
  valueText: [44, 62, 80],        // #2c3e50
  borderColor: [233, 236, 239],   // #e9ecef
  grayText: [108, 117, 125],      // #6c757d
  statusGreen: [40, 167, 69]      // #28a745
};

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
  const doc = new jsPDF('p', 'mm', 'a4');
  const t = translations[language];
  let yPosition = 0;

  // Helper til å konvertere pt til mm for jsPDF
  const ptToMm = (pt: number) => pt * 0.352778;
  
  // Opprett profesjonell header med gradient
  const createHeader = () => {
    // Hovedgradient bakgrunn (simulert med rektangler)
    doc.setFillColor(colors.primaryBlue[0], colors.primaryBlue[1], colors.primaryBlue[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Gradient simulering med flere lag
    for (let i = 0; i < 10; i++) {
      const opacity = i / 10;
      const r = colors.primaryBlue[0] + (colors.gradientBlue[0] - colors.primaryBlue[0]) * opacity;
      const g = colors.primaryBlue[1] + (colors.gradientBlue[1] - colors.primaryBlue[1]) * opacity;
      const b = colors.primaryBlue[2] + (colors.gradientBlue[2] - colors.primaryBlue[2]) * opacity;
      doc.setFillColor(r, g, b);
      doc.rect(0, 35 + i, 210, 1, 'F');
    }
    
    // Logo: 40pt = 14mm i jsPDF
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('MYHRVOLD GRUPPEN', 105, 15, { align: 'center' });
    
    // Undertittel: 17.6pt = 6.2mm i jsPDF
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text(t.subtitle, 105, 25, { align: 'center' });
    
    // Claim number boks med spesifisert styling
    doc.setFillColor(255, 255, 255, 0.2);
    doc.roundedRect(15, 50, 180, 20, 3, 3, 'F');
    
    // Venstre border (4pt = 1.4mm)
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.rect(15, 50, 1.4, 20, 'F');
    
    // Claim tittel: 22.4pt = 8mm i jsPDF
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.claimTitle} - ${claim.claim_number}`, 20, 58);
    
    // Status badge
    doc.setFillColor(colors.statusGreen[0], colors.statusGreen[1], colors.statusGreen[2]);
    doc.roundedRect(140, 53, 45, 10, 2, 2, 'F');
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(t.status.toUpperCase(), 162.5, 59, { align: 'center' });
    
    yPosition = 80;
  };

  // Seksjonstittel med sirkel (20pt diameter = 7mm)
  const addSectionHeader = (title: string) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Blå sirkel (20pt diameter = 7mm)
    doc.setFillColor(colors.primaryBlue[0], colors.primaryBlue[1], colors.primaryBlue[2]);
    doc.circle(18, yPosition + 2, 3.5, 'F');
    
    // Seksjonstittel: 20.8pt = 7.3mm i jsPDF
    doc.setTextColor(colors.labelText[0], colors.labelText[1], colors.labelText[2]);
    doc.setFontSize(21);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 25, yPosition + 5);
    
    yPosition += 15;
  };

  // Seksjon med korrekt bakgrunn og styling
  const startSection = (title: string, isSpecial: boolean = false) => {
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (!isSpecial) {
      // Seksjons bakgrunn: #f8f9fa
      doc.setFillColor(colors.sectionBg[0], colors.sectionBg[1], colors.sectionBg[2]);
      doc.roundedRect(15, yPosition, 180, 35, 3, 3, 'F');
      
      // Venstre border: 4pt = 1.4mm
      doc.setFillColor(colors.primaryBlue[0], colors.primaryBlue[1], colors.primaryBlue[2]);
      doc.roundedRect(15, yPosition, 1.4, 35, 1.5, 1.5, 'F');
    }
    
    addSectionHeader(title);
  };

  // Info-item med eksakt styling som spesifisert
  const addInfoItem = (label: string, value: string, x: number = 25, width: number = 80) => {
    if (yPosition > 265) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Info-item bakgrunn
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.roundedRect(x, yPosition, width, 15, 2, 2, 'F');
    
    // Border: 1pt = 0.35mm
    doc.setDrawColor(colors.borderColor[0], colors.borderColor[1], colors.borderColor[2]);
    doc.setLineWidth(0.35);
    doc.roundedRect(x, yPosition, width, 15, 2, 2, 'S');
    
    // Label (UPPERCASE): 14.4pt = 5.1mm
    doc.setTextColor(colors.labelText[0], colors.labelText[1], colors.labelText[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), x + 3, yPosition + 5);
    
    // Value: 17.6pt = 6.2mm
    doc.setTextColor(colors.valueText[0], colors.valueText[1], colors.valueText[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const wrappedValue = doc.splitTextToSize(value, width - 6);
    doc.text(wrappedValue, x + 3, yPosition + 10);
    
    yPosition += 18;
  };

  // To-kolonne layout som spesifisert
  const addTwoColumnGrid = (items: Array<{label: string, value: string}>) => {
    let currentY = yPosition;
    
    for (let i = 0; i < items.length; i += 2) {
      if (currentY > 250) {
        doc.addPage();
        currentY = yPosition = 20;
      }
      
      // Venstre kolonne
      const leftItem = items[i];
      if (leftItem) {
        yPosition = currentY;
        addInfoItem(leftItem.label, leftItem.value, 25, 80);
      }
      
      // Høyre kolonne
      const rightItem = items[i + 1];
      if (rightItem) {
        yPosition = currentY;
        addInfoItem(rightItem.label, rightItem.value, 115, 80);
      }
      
      currentY = yPosition;
    }
    
    yPosition = currentY;
  };

  // Full bredde info-item
  const addFullWidthInfo = (label: string, value: string) => {
    addInfoItem(label, value, 25, 170);
  };

  // Cost Summary med spesiell blå bakgrunn
  const addCostSummary = () => {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Blå sirkel for tittel
    doc.setFillColor(colors.primaryBlue[0], colors.primaryBlue[1], colors.primaryBlue[2]);
    doc.circle(18, yPosition + 2, 3.5, 'F');
    
    // Tittel
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(21);
    doc.setFont('helvetica', 'bold');
    doc.text(t.costSummary, 25, yPosition + 5);
    
    yPosition += 15;
    
    // Blå bakgrunn for cost summary
    doc.setFillColor(colors.primaryBlue[0], colors.primaryBlue[1], colors.primaryBlue[2]);
    doc.roundedRect(15, yPosition, 180, 25, 3, 3, 'F');
    
    yPosition += 8;
    
    // Cost items
    const addCostLine = (label: string, amount: number | undefined, isFinal: boolean = false) => {
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.setFontSize(isFinal ? 14 : 11);
      doc.setFont('helvetica', isFinal ? 'bold' : 'normal');
      
      doc.text(label, 25, yPosition);
      doc.text(formatCurrency(amount), 185, yPosition, { align: 'right' });
      
      if (!isFinal) {
        // Border-bottom med 20% opacity
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.2);
        doc.line(25, yPosition + 2, 185, yPosition + 2);
      }
      
      yPosition += isFinal ? 10 : 8;
    };
    
    addCostLine(t.totalCost, claim.total_cost);
    addCostLine(t.expectedRefund, claim.expected_refund, true);
    
    yPosition += 10;
  };

  // Footer med eksakt spesifikasjon
  const addFooter = () => {
    const footerY = 275;
    
    // Footer bakgrunn
    doc.setFillColor(colors.sectionBg[0], colors.sectionBg[1], colors.sectionBg[2]);
    doc.rect(0, footerY, 210, 22, 'F');
    
    // Border-top
    doc.setDrawColor(colors.borderColor[0], colors.borderColor[1], colors.borderColor[2]);
    doc.setLineWidth(0.35);
    doc.line(0, footerY, 210, footerY);
    
    // Footer tekst: 14.4pt = 5.1mm
    doc.setTextColor(colors.grayText[0], colors.grayText[1], colors.grayText[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');
    
    doc.text(t.footerText1, 105, footerY + 6, { align: 'center' });
    doc.text(`${t.footerText2}: ${claim.claim_number} | ${t.footerText3}: ${currentDate}`, 105, footerY + 12, { align: 'center' });
    
    // Fet tekst for siste linje
    doc.setFont('helvetica', 'bold');
    doc.text(`MYHRVOLD GRUPPEN - ${t.footerText4}`, 105, footerY + 18, { align: 'center' });
  };

  // Bygg PDF-en i riktig rekkefølge
  createHeader();
  
  // 1. Produktinformasjon
  startSection(t.productInfo);
  const productItems = [];
  if (claim.product_name) productItems.push({label: t.product, value: claim.product_name});
  if (claim.product_model) productItems.push({label: t.model, value: claim.product_model});
  if (claim.serial_number) productItems.push({label: t.serialNumber, value: claim.serial_number});
  if (claim.purchase_date) productItems.push({label: t.purchaseDate, value: formatDate(claim.purchase_date, language)});
  if (claim.warranty_period) productItems.push({label: t.warrantyPeriod, value: `${claim.warranty_period} ${t.year}`});
  addTwoColumnGrid(productItems);
  
  // 2. Feilbeskrivelse
  startSection(t.issueDescription);
  addFullWidthInfo(t.problem, claim.issue_description);
  if (claim.detailed_description) {
    addFullWidthInfo(t.detailedDescription, claim.detailed_description);
  }
  
  // 3. Kundeinformasjon
  startSection(t.customerInfo);
  const customerItems = [];
  if (claim.customer_name) customerItems.push({label: t.customer, value: claim.customer_name});
  if (claim.customer_address) customerItems.push({label: t.address, value: claim.customer_address});
  addTwoColumnGrid(customerItems);
  
  // 4. Utført arbeid
  startSection(t.workPerformed);
  const workItems = [];
  if (claim.technician_name) workItems.push({label: t.technician, value: claim.technician_name});
  if (claim.parts_cost) workItems.push({label: t.partsCost, value: formatCurrency(claim.parts_cost)});
  addTwoColumnGrid(workItems);
  
  // 5. Kostnadssammendrag (spesiell styling)
  addCostSummary();
  
  // Footer
  addFooter();

  // Last ned med riktig filnavn
  const fileName = language === 'no' 
    ? `garantikrav_${claim.claim_number}_NO.pdf`
    : `warranty_claim_${claim.claim_number}_EN.pdf`;
  
  doc.save(fileName);
};