import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

interface MaintenanceAgreement {
  avtale_nummer: string;
  kunde_navn: string;
  kunde_adresse?: string;
  kontaktperson?: string;
  telefon?: string;
  epost?: string;
  start_dato: string;
  slutt_dato?: string;
  besok_per_ar: number;
  pris_grunnlag: number;
  pris_cpi_justerbar: boolean;
  beskrivelse?: string;
  vilkar?: string;
  garantivilkar?: string;
  prosedyrer_ved_service?: string;
  kontakt_info?: string;
  equipment: Array<{
    produkt_navn: string;
    modell?: string;
    serienummer?: string;
    kategori?: string;
    lokasjon?: string;
    service_intervall_måneder?: number;
  }>;
}

interface GeneratePDFData {
  agreement: MaintenanceAgreement;
}

export const generateMaintenancePDF = async (data: GeneratePDFData) => {
  const { agreement } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set up fonts and styling
  doc.setFont('helvetica');
  
  let yPosition = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - (margin * 2);
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102); // Dark blue
  doc.text('T.MYHRVOLD AS', margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('Vedlikeholdsavtale', margin, yPosition);
  
  yPosition += 15;
  
  // Agreement header
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`Avtale: ${agreement.avtale_nummer}`, margin, yPosition);
  
  yPosition += 15;
  
  // Customer information
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('KUNDEOPPLYSNINGER', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const customerInfo = [
    `Kunde: ${agreement.kunde_navn}`,
    agreement.kunde_adresse ? `Adresse: ${agreement.kunde_adresse}` : null,
    agreement.kontaktperson ? `Kontaktperson: ${agreement.kontaktperson}` : null,
    agreement.telefon ? `Telefon: ${agreement.telefon}` : null,
    agreement.epost ? `E-post: ${agreement.epost}` : null,
  ].filter(Boolean);
  
  customerInfo.forEach(info => {
    doc.text(info!, margin, yPosition);
    yPosition += 5;
  });
  
  yPosition += 10;
  
  // Agreement details
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('AVTALEVILKÅR', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const agreementDetails = [
    `Startdato: ${format(new Date(agreement.start_dato), 'dd.MM.yyyy', { locale: nb })}`,
    agreement.slutt_dato ? `Sluttdato: ${format(new Date(agreement.slutt_dato), 'dd.MM.yyyy', { locale: nb })}` : 'Sluttdato: Ikke angitt',
    `Besøk per år: ${agreement.besok_per_ar}`,
    `Årlig pris: ${new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(agreement.pris_grunnlag)}`,
    `KPI-justering: ${agreement.pris_cpi_justerbar ? 'Aktivert' : 'Deaktivert'}`,
  ];
  
  agreementDetails.forEach(detail => {
    doc.text(detail, margin, yPosition);
    yPosition += 5;
  });
  
  if (agreement.beskrivelse) {
    yPosition += 5;
    doc.text('Beskrivelse av tjenester:', margin, yPosition);
    yPosition += 5;
    
    // Split long text into lines
    const lines = doc.splitTextToSize(agreement.beskrivelse, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
  }
  
  yPosition += 10;
  
  // Equipment section
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('MASKINER OG UTSTYR', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  if (agreement.equipment && agreement.equipment.length > 0) {
    agreement.equipment.forEach((eq, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 51, 102);
      doc.text(`${index + 1}. ${eq.produkt_navn}`, margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      const equipmentDetails = [
        eq.modell ? `Modell: ${eq.modell}` : null,
        eq.serienummer ? `Serienummer: ${eq.serienummer}` : null,
        eq.kategori ? `Kategori: ${eq.kategori}` : null,
        eq.lokasjon ? `Lokasjon: ${eq.lokasjon}` : null,
        eq.service_intervall_måneder ? `Service-intervall: ${eq.service_intervall_måneder} måneder` : null,
      ].filter(Boolean);
      
      equipmentDetails.forEach(detail => {
        doc.text(`  ${detail}`, margin, yPosition);
        yPosition += 4;
      });
      
      yPosition += 3;
    });
  } else {
    doc.text('Ingen utstyr registrert', margin, yPosition);
    yPosition += 5;
  }
  
  yPosition += 10;
  
  // Terms and conditions
  if (agreement.vilkar) {
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('SPESIELLE VILKÅR', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const lines = doc.splitTextToSize(agreement.vilkar, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
  }

  // Warranty terms
  if (agreement.garantivilkar) {
    // Check if we need a new page
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('GARANTIVILKÅR', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const warrantyLines = doc.splitTextToSize(agreement.garantivilkar, contentWidth);
    warrantyLines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    yPosition += 10;
  }

  // Service procedures
  if (agreement.prosedyrer_ved_service) {
    // Check if we need a new page
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('PROSEDYRER VED SERVICE', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const procedureLines = doc.splitTextToSize(agreement.prosedyrer_ved_service, contentWidth);
    procedureLines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    yPosition += 10;
  }

  // Contact information
  if (agreement.kontakt_info) {
    // Check if we need a new page
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('KONTAKTINFORMASJON', margin, yPosition);
    
    yPosition += 8;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    const contactLines = doc.splitTextToSize(agreement.kontakt_info, contentWidth);
    contactLines.forEach((line: string) => {
      // Check if we need a new page
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    
    yPosition += 10;
  }

  // Standard terms (always include)
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('GENERELLE BETINGELSER', margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  
  const standardTerms = [
    '1. Vedlikeholdsarbeid utføres i henhold til produsentens anbefalinger.',
    '2. Eventuelle reservedeler faktureres separat.',
    '3. Kunden plikter å gi tekniker tilgang til utstyret på avtalt tid.',
    '4. Ved avbestilling med mindre enn 24 timers varsel kan gebyr påløpe.',
    '5. Avtalen kan sies opp med 3 måneders skriftlig varsel.',
    '6. Ved tekniske feil som ikke dekkes av vedlikeholdsavtalen, gis separat pristilbud.',
  ];
  
  standardTerms.forEach(term => {
    const lines = doc.splitTextToSize(term, contentWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 4;
    });
    yPosition += 2;
  });
  
  yPosition += 15;
  
  // Signatures
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text('SIGNATURER', margin, yPosition);
  
  yPosition += 15;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Company signature
  doc.text('For T.Myhrvold AS:', margin, yPosition);
  yPosition += 20;
  doc.line(margin, yPosition, margin + 60, yPosition);
  yPosition += 5;
  doc.text('Dato og underskrift', margin, yPosition);
  
  // Customer signature
  yPosition -= 25;
  const customerSigX = margin + 120;
  doc.text('For kunde:', customerSigX, yPosition);
  yPosition += 20;
  doc.line(customerSigX, yPosition, customerSigX + 60, yPosition);
  yPosition += 5;
  doc.text('Dato og underskrift', customerSigX, yPosition);
  
  // Footer
  yPosition = doc.internal.pageSize.height - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('T.Myhrvold AS - Postboks 158, 9481 Honningsvåg - Tlf: 000 00 000', margin, yPosition);
  
  // Generate filename and download
  const fileName = `Vedlikeholdsavtale_${agreement.avtale_nummer}_${format(new Date(), 'ddMMyy')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};