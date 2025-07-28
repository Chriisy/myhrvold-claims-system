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
    footerText2: "Din partner for profesjonell service",
    year: "år",
    generatedText: "Generert"
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
    footerText2: "Your partner for professional service",
    year: "year",
    generatedText: "Generated"
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

  // Colors (Myhrvold Gruppen brand colors)
  const primaryColor = [30, 58, 95]; // #1e3a5f
  const secondaryColor = [44, 90, 160]; // #2c5aa0
  const lightGray = [248, 249, 250]; // #f8f9fa
  const textColor = [44, 62, 80]; // #2c3e50

  // Header with gradient-like effect
  const createHeader = () => {
    // Main header background
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, 'F');
    
    // Gradient effect simulation
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 40, 210, 10, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MYHRVOLD GRUPPEN', 105, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(t.subtitle, 105, 30, { align: 'center' });
    
    // Claim number box
    doc.setFillColor(255, 255, 255, 0.2);
    doc.rect(15, 55, 180, 20, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.rect(15, 55, 180, 20);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t.claimTitle} - ${claim.claim_number}`, 20, 63);
    
    // Status badge
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(t.status, 20, 70);
    
    yPosition = 85;
  };

  // Helper function to create professional sections
  const addSection = (title: string) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Section background
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(15, yPosition - 5, 180, 15, 'F');
    
    // Left border accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition - 5, 4, 15, 'F');
    
    // Section title
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 25, yPosition + 4);
    
    yPosition += 20;
  };

  // Helper function to add info items in a grid-like layout
  const addInfoItem = (label: string, value: string, isFullWidth: boolean = false) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Background box
    doc.setFillColor(255, 255, 255);
    const boxWidth = isFullWidth ? 180 : 85;
    doc.rect(15, yPosition - 3, boxWidth, 12, 'F');
    doc.setDrawColor(233, 236, 239);
    doc.setLineWidth(0.2);
    doc.rect(15, yPosition - 3, boxWidth, 12);
    
    // Label
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), 18, yPosition + 1);
    
    // Value
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const splitValue = doc.splitTextToSize(value, boxWidth - 6);
    doc.text(splitValue, 18, yPosition + 6);
    
    if (!isFullWidth) {
      yPosition += 15;
    } else {
      yPosition += Math.max(15, splitValue.length * 4 + 8);
    }
  };

  // Cost summary section with special styling
  const addCostSummary = () => {
    if (yPosition > 230) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Special background for cost summary
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition - 5, 180, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.costSummary, 25, yPosition + 4);
    yPosition += 15;
    
    // Cost items
    const addCostItem = (label: string, amount: number | undefined, isTotal: boolean = false) => {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(isTotal ? 12 : 10);
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      
      doc.text(label, 25, yPosition);
      doc.text(formatCurrency(amount), 185, yPosition, { align: 'right' });
      
      if (!isTotal) {
        doc.setDrawColor(255, 255, 255, 0.3);
        doc.setLineWidth(0.2);
        doc.line(25, yPosition + 2, 185, yPosition + 2);
      }
      
      yPosition += isTotal ? 10 : 8;
    };
    
    addCostItem(t.totalCost, claim.total_cost);
    addCostItem(t.expectedRefund, claim.expected_refund, true);
    
    yPosition += 10;
  };

  // Footer
  const addFooter = () => {
    const footerY = 280;
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(0, footerY, 210, 17, 'F');
    
    doc.setTextColor(108, 117, 125);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const currentDate = new Date().toLocaleDateString(language === 'no' ? 'nb-NO' : 'en-GB');
    
    doc.text(t.footerText1, 105, footerY + 5, { align: 'center' });
    doc.text(`${claim.claim_number} | ${t.generatedText}: ${currentDate}`, 105, footerY + 9, { align: 'center' });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`MYHRVOLD GRUPPEN - ${t.footerText2}`, 105, footerY + 13, { align: 'center' });
  };

  // Build the PDF
  createHeader();
  
  // Product Information
  addSection(t.productInfo);
  addInfoItem(t.product, claim.product_name);
  if (claim.product_model) {
    addInfoItem(t.model, claim.product_model);
  }
  if (claim.serial_number) {
    addInfoItem(t.serialNumber, claim.serial_number);
  }
  if (claim.purchase_date) {
    addInfoItem(t.purchaseDate, formatDate(claim.purchase_date, language));
  }
  if (claim.warranty_period) {
    addInfoItem(t.warrantyPeriod, `${claim.warranty_period} ${t.year}`);
  }
  
  // Issue Description
  addSection(t.issueDescription);
  addInfoItem(t.problem, claim.issue_description, true);
  if (claim.detailed_description) {
    addInfoItem(t.detailedDescription, claim.detailed_description, true);
  }
  
  // Customer Information
  addSection(t.customerInfo);
  addInfoItem(t.customer, claim.customer_name);
  if (claim.customer_address) {
    addInfoItem(t.address, claim.customer_address, true);
  }
  
  // Work Performed
  addSection(t.workPerformed);
  addInfoItem(t.technician, claim.technician_name);
  if (claim.parts_cost) {
    addInfoItem(t.partsCost, formatCurrency(claim.parts_cost));
  }
  
  // Cost Summary
  addCostSummary();
  
  // Footer
  addFooter();

  // Download the PDF
  const fileName = language === 'no' 
    ? `garantikrav_${claim.claim_number}_NO.pdf`
    : `warranty_claim_${claim.claim_number}_EN.pdf`;
  
  doc.save(fileName);
};