import { createWorker } from 'tesseract.js';
import { ScannedInvoiceData } from '@/types/scanner';

export class OCRService {
  private static parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    
    // Handle Norwegian number format: "3 025,00" or "3025.00" or "3025"
    let cleaned = amountStr.trim();
    
    // Remove currency symbols and extra spaces
    cleaned = cleaned.replace(/kr|NOK/gi, '').trim();
    
    // Handle different decimal separators and thousand separators
    if (cleaned.includes(',') && cleaned.includes(' ')) {
      // Format: "3 025,00" - space as thousand, comma as decimal
      cleaned = cleaned.replace(/\s/g, '').replace(',', '.');
    } else if (cleaned.includes(',')) {
      // Format: "3025,00" - comma as decimal
      cleaned = cleaned.replace(',', '.');
    } else if (cleaned.includes(' ')) {
      // Format: "3 025" - space as thousand separator only
      cleaned = cleaned.replace(/\s/g, '');
    }
    
    const result = parseFloat(cleaned) || 0;
    console.log(`Parsing amount: "${amountStr}" -> ${result}`);
    return result;
  }

  private static getInvoicePatterns() {
    return {
      // Enhanced patterns based on T.MYHRVOLD invoice analysis
      invoiceNumber: /(?:Faktura|FAKTURA)[\s\S]*?(\d{7,8})|(?:^|\s)(\d{7})(?:\s|$)/mi,
      customerName: /(?:Ordreadresse:|Kundenr:|til:|AS\s*$)[\s\n]*([A-ZÆØÅ][A-Za-zæøåÆØÅ\s&\.-]{3,50}(?:\s+AS|\s+ASA)?)/mi,
      customerOrgNumber: /(?:Org\.?\s*nr\.?|Orgnr)[:\s]*([NO]?\d{9}[A-Z]*)/i,
      productName: /(?:Time\s+service|Bil\s+[-‑]\s+Sone|Grønn\s+bryter|Touch\s+screen|Time\s+kjøring|COMENDA|Parkering|Kilometer\s+servicebesøk)/i,
      productModel: /(?:Produktnummer|Modell|COM\d+|AG\d+|HTE\s+\d+)[:\s]*([A-Z0-9\-\.]+)/i,
      totalAmount: /(?:Sum\s+avgiftsfritt|Ordresum|Total)[\s\n]*(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      laborCost: /(?:Time\s+service|T1|RT1?)[\s\S]*?(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      partsCost: /(?:Bil\s+[-‑]\s+Sone|bryter|screen|Parkering|Servicemateriel|COM\d+|Grønn|Touch)[\s\S]*?(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      evaticJobNumber: /(?:Prosjekt\s+nummer[:\s]*|Service\s+nr[:\s]*|Prosjekt\s+nr[:\s]*|nummer[:\s]*)(\d{5,6})/i,
      invoiceDate: /(?:Fakturadato|Ordredato)[:\s]*(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})/i,
      kidNumber: /KID[:\s]*(\d{7,10})/i
    };
  }

  private static extractValue(text: string, pattern: RegExp, defaultValue: any = '') {
    const match = text.match(pattern);
    if (match) {
      // Try both capture groups for invoice number
      if (pattern === this.getInvoicePatterns().invoiceNumber) {
        return (match[1] || match[2] || '').trim();
      }
      return match[1].trim();
    }
    return defaultValue;
  }

  private static extractAmount(text: string, pattern: RegExp) {
    const match = text.match(pattern);
    if (match) {
      return this.parseAmount(match[1]);
    }
    return 0;
  }

  private static extractCustomer(text: string) {
    const patterns = this.getInvoicePatterns();
    
    // Try primary pattern first
    let customer = this.extractValue(text, patterns.customerName);
    
    // If not found, try fallback patterns
    if (!customer) {
      // Look for company names ending with AS/ASA
      const companyMatch = text.match(/([A-ZÆØÅ][A-Za-zæøåÆØÅ\s&\.-]{3,50}(?:\s+AS|\s+ASA))/i);
      if (companyMatch) {
        customer = companyMatch[1].trim();
      }
    }
    
    // Clean up customer name
    if (customer) {
      customer = customer.replace(/^[-\s]+|[-\s]+$/g, '').replace(/\s+/g, ' ');
    }
    
    return customer;
  }

  public static parseVismaInvoice(text: string): ScannedInvoiceData {
    console.log('Parsing text:', text);
    
    const patterns = this.getInvoicePatterns();

    const data: ScannedInvoiceData = {
      // Invoice details
      invoiceNumber: this.extractValue(text, patterns.invoiceNumber),
      invoiceDate: this.extractValue(text, patterns.invoiceDate),
      
      // Customer information
      customerName: this.extractCustomer(text),
      customerNumber: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      customerOrgNumber: this.extractValue(text, patterns.customerOrgNumber),
      
      // Product information
      productName: this.extractValue(text, patterns.productName) || 'Service/Reparasjon',
      productNumber: '',
      productModel: this.extractValue(text, patterns.productModel),
      serialNumber: '',
      msNumber: '',
      shortDescription: '',
      detailedDescription: '',
      
      // Work costs
      technicianHours: 0,
      hourlyRate: 0,
      workCost: this.extractAmount(text, patterns.laborCost),
      overtime50Hours: 0,
      overtime50Cost: 0,
      overtime100Hours: 0,
      overtime100Cost: 0,
      travelTimeHours: 0,
      travelTimeCost: 0,
      vehicleKm: 0,
      krPerKm: 7.5,
      vehicleCost: 0,
      
      // Technician details
      technician: '',
      department: '',
      
      // Legacy fields for compatibility
      laborCost: this.extractAmount(text, patterns.laborCost),
      partsCost: this.extractAmount(text, patterns.partsCost),
      totalAmount: this.extractAmount(text, patterns.totalAmount),
      evaticJobNumber: this.extractValue(text, patterns.evaticJobNumber),
      confidence: 0
    };

    console.log('Extracted data:', data);

    // Calculate confidence score
    let confidence = 0;
    let totalFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'confidence') return;
      totalFields++;
      if (value && value !== '') {
        confidence++;
      }
    });

    data.confidence = totalFields > 0 ? confidence / totalFields : 0;
    return data;
  }

  public static async processImage(file: File): Promise<{ text: string; confidence: number }> {
    // Process with Tesseract.js - optimized for Norwegian invoices
    const worker = await createWorker(['nor', 'eng'], 1, {
      logger: m => console.log(m)
    });

    // Enhanced OCR parameters for Norwegian invoices
    await worker.setParameters({
      'tessedit_char_whitelist': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅabcdefghijklmnopqrstuvwxyzæøå .,-:/()',
      'preserve_interword_spaces': '1'
    });

    const { data: { text, confidence } } = await worker.recognize(file);
    await worker.terminate();

    console.log('OCR Confidence:', confidence);
    console.log('OCR Text length:', text.length);
    console.log('OCR Text:', text);

    return { text, confidence };
  }
}