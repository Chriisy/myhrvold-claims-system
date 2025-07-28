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

const translations = {
  no: {
    subtitle: "Profesjonell Service & Support",
    claimTitle: "Garantiskrav",
    status: "Under behandling",
    productInfo: "Produktinformasjon",
    product: "Produkt",
    model: "Modell", 
    serialNumber: "Serienummer",
    purchaseDate: "Kjøpsdato",
    warrantyPeriod: "Garantiperiode",
    issueDescription: "Feilbeskrivelse",
    problem: "Problem",
    detailedDescription: "Detaljert beskrivelse",
    customerInfo: "Kundeinformasjon",
    customer: "Kunde",
    address: "Adresse",
    workPerformed: "Utført arbeid",
    technician: "Tekniker",
    partsCost: "Deler kostnad",
    costSummary: "Kostnadssammendrag",
    totalCost: "Total kostnad",
    expectedRefund: "Forventet refusjon",
    footerText1: "Dette dokumentet er generert automatisk fra vårt garantisystem.",
    footerText2: "Krav nummer",
    footerText3: "Generert",
    footerText4: "Myhrvold Gruppen - Din partner for profesjonell service",
    year: "år"
  },
  en: {
    subtitle: "Professional Service & Support", 
    claimTitle: "Warranty Claim",
    status: "Under Review",
    productInfo: "Product Information",
    product: "Product",
    model: "Model",
    serialNumber: "Serial Number",
    purchaseDate: "Purchase Date", 
    warrantyPeriod: "Warranty Period",
    issueDescription: "Issue Description",
    problem: "Problem",
    detailedDescription: "Detailed Description",
    customerInfo: "Customer Information",
    customer: "Customer",
    address: "Address",
    workPerformed: "Work Performed",
    technician: "Technician",
    partsCost: "Parts Cost",
    costSummary: "Cost Summary",
    totalCost: "Total Cost",
    expectedRefund: "Expected Refund",
    footerText1: "This document was generated automatically from our warranty system.",
    footerText2: "Claim Number",
    footerText3: "Generated",
    footerText4: "Myhrvold Gruppen - Your partner for professional service",
    year: "year"
  }
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
  const doc = new jsPDF();
  const t = translations[language];
  let yPosition = 0;

  // Myhrvold Gruppen brand colors
  const primaryBlue = [30, 58, 95];     // #1e3a5f
  const gradientBlue = [44, 90, 160];   // #2c5aa0  
  const lightGray = [243, 244, 246];    // #f3f4f6
  const darkGray = [75, 85, 99];        // #4b5563
  const greenStatus = [34, 197, 94];    // #22c55e

  // Create professional header
  const createHeader = () => {
    // Main header background with gradient effect
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Gradient simulation
    doc.setFillColor(gradientBlue[0], gradientBlue[1], gradientBlue[2]);
    doc.rect(0, 35, 210, 10, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MYHRVOLD GRUPPEN', 105, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(t.subtitle, 105, 30, { align: 'center' });
    
    // Claim info box
    doc.setFillColor(255, 255, 255, 0.15);
    doc.rect(20, 50, 170, 18, 'F');
    doc.setDrawColor(255, 255, 255, 0.4);
    doc.setLineWidth(1);
    doc.rect(20, 50, 170, 18);
    
    // Claim title and number
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.claimTitle} - ${claim.claim_number}`, 25, 58);
    
    // Status badge
    doc.setFillColor(greenStatus[0], greenStatus[1], greenStatus[2]);
    doc.rect(140, 52, 45, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(t.status.toUpperCase(), 162.5, 58, { align: 'center' });
    
    yPosition = 80;
  };

  // Section header with bullet point style
  const addSectionHeader = (title: string) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Blue bullet point
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.circle(25, yPosition - 2, 3, 'F');
    
    // Section title
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 32, yPosition);
    
    yPosition += 10;
  };

  // Two-column layout for info items
  const addInfoGrid = (items: Array<{label: string, value: string, isLeftColumn?: boolean}>) => {
    let leftY = yPosition;
    let rightY = yPosition;
    
    items.forEach((item, index) => {
      const isLeft = item.isLeftColumn !== false && index % 2 === 0;
      const xPos = isLeft ? 35 : 115;
      const currentY = isLeft ? leftY : rightY;
      
      if (currentY > 270) {
        doc.addPage();
        leftY = rightY = yPosition = 20;
      }
      
      // Label
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(item.label.toUpperCase(), xPos, currentY);
      
      // Value
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const wrappedText = doc.splitTextToSize(item.value, 70);
      doc.text(wrappedText, xPos, currentY + 5);
      
      const lineHeight = wrappedText.length * 4 + 12;
      
      if (isLeft) {
        leftY += lineHeight;
      } else {
        rightY += lineHeight;
      }
    });
    
    yPosition = Math.max(leftY, rightY) + 5;
  };

  // Full-width info item
  const addFullWidthInfo = (label: string, value: string) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Label
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), 35, yPosition);
    
    // Value
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const wrappedText = doc.splitTextToSize(value, 155);
    doc.text(wrappedText, 35, yPosition + 5);
    
    yPosition += wrappedText.length * 4 + 15;
  };

  // Cost summary with special styling
  const addCostSummary = () => {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Blue bullet point
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.circle(25, yPosition - 2, 3, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.costSummary, 32, yPosition);
    
    // Background for cost summary
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(20, yPosition + 5, 170, 30, 'F');
    
    yPosition += 15;
    
    // Cost items
    const addCostLine = (label: string, amount: number | undefined, isBold: boolean = false) => {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(isBold ? 11 : 10);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      doc.text(label, 30, yPosition);
      doc.text(formatCurrency(amount), 180, yPosition, { align: 'right' });
      
      yPosition += 8;
    };
    
    addCostLine(t.totalCost, claim.total_cost);
    addCostLine(t.expectedRefund, claim.expected_refund, true);
    
    yPosition += 10;
  };

  // Footer
  const addFooter = () => {
    const footerY = 275;
    
    // Footer background
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(0, footerY, 210, 22, 'F');
    
    // Footer text
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');
    
    doc.text(t.footerText1, 105, footerY + 6, { align: 'center' });
    doc.text(`${t.footerText2}: ${claim.claim_number} | ${t.footerText3}: ${currentDate}`, 105, footerY + 12, { align: 'center' });
    doc.text(t.footerText4, 105, footerY + 18, { align: 'center' });
  };

  // Build the PDF
  createHeader();
  
  // Product Information
  addSectionHeader(t.productInfo);
  const productItems = [];
  if (claim.product_name) productItems.push({label: t.product, value: claim.product_name});
  if (claim.product_model) productItems.push({label: t.model, value: claim.product_model});
  if (claim.serial_number) productItems.push({label: t.serialNumber, value: claim.serial_number});
  if (claim.purchase_date) productItems.push({label: t.purchaseDate, value: formatDate(claim.purchase_date, language)});
  if (claim.warranty_period) productItems.push({label: t.warrantyPeriod, value: `${claim.warranty_period} ${t.year}`});
  addInfoGrid(productItems);
  
  // Issue Description
  addSectionHeader(t.issueDescription);
  addFullWidthInfo(t.problem, claim.issue_description);
  if (claim.detailed_description) {
    addFullWidthInfo(t.detailedDescription, claim.detailed_description);
  }
  
  // Customer Information
  addSectionHeader(t.customerInfo);
  const customerItems = [];
  if (claim.customer_name) customerItems.push({label: t.customer, value: claim.customer_name});
  if (claim.customer_address) customerItems.push({label: t.address, value: claim.customer_address});
  addInfoGrid(customerItems);
  
  // Work Performed
  addSectionHeader(t.workPerformed);
  const workItems = [];
  if (claim.technician_name) workItems.push({label: t.technician, value: claim.technician_name});
  if (claim.parts_cost) workItems.push({label: t.partsCost, value: formatCurrency(claim.parts_cost)});
  addInfoGrid(workItems);
  
  // Cost Summary
  addCostSummary();
  
  // Footer
  addFooter();

  // Download
  const fileName = language === 'no' 
    ? `garantikrav_${claim.claim_number}_NO.pdf`
    : `warranty_claim_${claim.claim_number}_EN.pdf`;
  
  doc.save(fileName);
};