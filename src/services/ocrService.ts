import { createWorker } from 'tesseract.js';
import { ScannedInvoiceData } from '@/types/scanner';
import { parseMyhrvold, validateMyhrvoldInvoice } from '@/utils/myhrvoldParser';
import { supabase } from '@/integrations/supabase/client';

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
      // 🏢 KUNDEINFORMASJON (Kritisk - 30%) - Enhanced for T.MYHRVOLD format
      customerName: /(?:Ordreadresse:|Lev\.adr:|til:|Kunde:)[\s\n]*([A-ZÆØÅ][A-Za-zæøåÆØÅ\s&\.-]{2,50}(?:\s+AS|\s+ASA|\s+DA|\s+BA|\s+ANS)?)|([A-ZÆØÅ][A-Za-zæøåÆØÅ\s&\.-]{2,50}(?:\s+AS|\s+ASA|\s+DA|\s+BA|\s+ANS))/mi,
      customerNumber: /(?:Kundenr\.?[:\s]*(\d{4,8})|KN\d{6}|Kunde\s*nr\.?\s*(\d{4,8}))/i,
      contactPerson: /(?:Kontakt:|Att:|Attn:|Ref:|Innmeldt\s+av)[\s]*([A-ZÆØÅ][A-Za-zæøåÆØÅ\s\.-]{2,40})/i,
      email: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      phone: /((?:\+47\s?)?\d{2}\s?\d{2}\s?\d{2}\s?\d{3})/i,
      address: /(?:Adresse:|Postadresse:|Ordreadresse:)[\s]*([A-ZÆØÅ][A-Za-zæøåÆØÅ\s\d.,-]+(?:\d{4}\s+[A-ZÆØÅ][a-zæøå]+)?)/i,
      customerOrgNumber: /(?:Org\.?\s*nr\.?|Orgnr|Organisasjonsnummer)[:\s]*([NO]?\d{9}[A-Z]*)/i,
      
      // 🔧 PRODUKTINFORMASJON (Kritisk - 25%) - Enhanced for service equipment
      productName: /(?:Kjøleskap|Model|Touch\s+screen|Display|Kompressor|Service|Reparasjon|Oppgradering|Comenda|Sirman|pakkebord|maskin|bryter|pumpe)/i,
      productModel: /(?:Model\s+([A-Z]\d{3,4})|Modell:\s*([A-Z0-9\-]+)|([A-Z]{3,15}\d{2,4}\-\d{2,4})|LOKRS\d{3}\-\d{3})/i,
      productNumber: /(?:Prod\.?nr\.?\s*(\w+)|Art\.?nr\.?\s*(\w+)|([A-Z]{3,8}\d{2,4}\-\d{2,4}))/i,
      serialNumber: /(?:S\/?N\.?\s*([A-Z0-9]{6,12})|Serie:\s*([A-Z0-9]+))/i,
      purchaseDate: /(?:Kjøpt:|Dato:|Lev\.dato:).*?(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/i,
      supplier: /([A-ZÆØÅ][A-Za-zæøåÆØÅ\s&\.-]+(?:\s+AS|\s+ASA|\s+DA|\s+BA))(?=.*leverandør|.*supplier)/i,
      
      // 💰 ØKONOMISK INFORMASJON (Viktig - 20%) - Enhanced for T.MYHRVOLD format
      technicianHours: /(?:Time\s+service[^\d]*(\d+(?:[.,]\d+)?)\s*timer?|(\d+(?:[.,]\d+)?)\s*timer?|Time.*?(\d{1,4})\s*kr)/i,
      hourlyRate: /(?:(\d{3,5})\s*kr\/time|Kr\s*per\s*time.*?(\d{3,5})|Time\s+service.*?(\d{3,4}))/i,
      workCost: /(?:Arbeid.*?(\d+[.,]?\d*)\s*kr|Time\s+service.*?(\d{1,3}(?:\s\d{3})*(?:[.,]\d{2})?))/i,
      overtime50: /(?:Overtid.*50%.*?(\d+[.,]?\d*)\s*kr)/i,
      overtime100: /(?:Overtid.*100%.*?(\d+[.,]?\d*)\s*kr)/i,
      travelTime: /(?:Reisetid.*?(\d+[.,]?\d*)\s*kr|Reise.*?(\d+[.,]?\d*)|Bil\s+[-–]\s+Sone.*?(\d+[.,]?\d*))/i,
      vehicleKm: /(?:Kjøretøy.*?(\d+)\s*km|Km.*?(\d+))/i,
      krPerKm: /(?:(\d+[.,]?\d*)\s*kr\/km)/i,
      vehicleCost: /(?:Kjøring.*?(\d+[.,]?\d*)\s*kr|Bil.*?(\d+[.,]?\d*)|Parkering.*?(\d+[.,]?\d*))/i,
      additionalCosts: /(?:Tillegg.*?(\d+[.,]?\d*)\s*kr|Servicemateriell.*?(\d+[.,]?\d*))/i,
      
      // 📋 JOBBREFERANSE (Viktig - 15%) - Enhanced for T.MYHRVOLD format
      evaticJobNumber: /(?:(EV-\d{4}-\d{3})|Evatic.*?(\d{4}-\d{3}))/i,
      msNumber: /(?:(MS-\d{4}-\d{3})|MS.*?(\d{4}-\d{3}))/i,
      projectNumber: /(?:Prosjekt\s*nr\.?[:\s]*(\d{5,6})|P\.?nr\.?\s*(\d{5,6}))/i,
      orderNumber: /(?:Ordrenr\.?[:\s]*(\d{5,8})|Ordre.*?(\d{6,8})|O\.?nr\.?\s*(\d{6,8}))/i,
      serviceNumber: /(?:Service\s*nr\.?[:\s]*(\d{5,6}))/i,
      
      // ⚠️ PROBLEMBESKRIVELSE (Viktig - 10%) - Enhanced for T.MYHRVOLD format
      issueType: /(?:Service|Reparasjon|Garanti|Reklamasjon|Vedlikehold|Bytte|defekt)/i,
      urgencyLevel: /(?:Normal|Akutt|Kritisk|Lav)/i,
      shortDescription: /(?:Feil:|Problem:|Beskrivelse:|Årsak:|Oppdrag:|Innmeldt)[\s]*([A-Za-zæøåÆØÅ\s\.\,\-\:]{5,200})/i,
      symptoms: /(?:Virker\s+ikke|Stopper|Lyd|Temperatur|Display|spyler\s+ikke|defekt|fungerer\s+ikke)/i,
      workDescription: /(?:Oppdrag:|Jobb\s+utført:|Beskrivelse)[\s\n:]*([A-Za-zæøåÆØÅ\s\.\,\-\:\(\)]{10,300})/i,
      
      // 🎯 Garantivurdering
      warrantyPeriod: /(?:Garanti.*?(\d+)\s*(?:år|mnd|måned))/i,
      warrantyStatus: /(?:(Innenfor|Utenfor|Utløpt).*garanti)/i,
      warrantyStart: /(?:Garantidato:|Fra.*?(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}))/i,
      
      // Reklamasjonsspesifikt
      claimDate: /(?:Rekl\.dato:|Meldt.*?(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}))/i,
      previousService: /(?:Tidligere.*service|Sist.*service.*?(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4}))/i,
      spareParts: /(?:Reservedel:|Del\s+nr:|Byttet.*del)[\s]*([A-Z0-9\-]+)/i,
      
      // Legacy patterns for compatibility - Enhanced for T.MYHRVOLD format
      invoiceNumber: /(?:Faktura[\s\n]*(\d{7,8})|(\d{7,8})(?=\s*Fakturadat)|^(\d{7,8})$|(?:Nr\.?\s*)?(\d{7,8})(?=\s*$))/mi,
      totalAmount: /(?:Sum\s+avgiftsfritt|Ordresum|Sum\s+eks|Total\s+eks|Ordresum)[\s\n]*(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      laborCost: /(?:Time\s+service|Timer?|T1)[\s\S]*?(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      partsCost: /(?:Touch\s+screen|Blase|Oppgradering|materiale|LOKRS|bryter|R1|S1)[\s\S]*?(\d{1,3}(?:[\s,]\d{3})*(?:[,\.]\d{2})?)/i,
      invoiceDate: /(?:Fakturadato|dato)[:\s]*(\d{1,2}[\.\/\-]\d{1,2}[\.\/\-]\d{2,4})/i,
      kidNumber: /KID[:\s]*(\d{8,10})/i,
      technicianName: /(?:Tekniker[:\s]+)([A-ZÆØÅ][A-Za-zæøåÆØÅ\s]+)/i
    };
  }

  private static extractValue(text: string, pattern: RegExp, defaultValue: any = '') {
    const match = text.match(pattern);
    if (match) {
      // Try multiple capture groups for invoice number and customer name
      if (pattern === this.getInvoicePatterns().invoiceNumber) {
        return (match[1] || match[2] || match[3] || '').trim();
      }
      if (pattern === this.getInvoicePatterns().customerName) {
        return (match[1] || match[2] || '').trim();
      }
      return (match[1] || '').trim();
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

  public static async parseVismaInvoice(text: string, file?: File): Promise<ScannedInvoiceData> {
    console.log('Parsing invoice with enhanced detection...');
    
    // Check if this is OpenAI JSON response
    let openAIData: any = null;
    try {
      const jsonData = JSON.parse(text);
      if (jsonData.invoiceNumber && jsonData.customerName) {
        openAIData = jsonData;
        console.log('Processing OpenAI JSON data:', openAIData);
      }
    } catch (e) {
      // Not JSON, continue with text parsing
    }
    
    // If we have OpenAI data, use it directly (already corrected for T. Myhrvold)
    if (openAIData) {
      return {
        // Invoice details
        invoiceNumber: openAIData.invoiceNumber || '',
        invoiceDate: openAIData.invoiceDate || '',
        
        // Customer information
        customerName: openAIData.customerName || '',
        customerNumber: openAIData.customerNumber || '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        customerOrgNumber: openAIData.customerOrgNumber || '',
        
        // Product information
        productName: openAIData.productName || '',
        productNumber: openAIData.serviceNumber || '',
        productModel: '',
        serialNumber: '',
        msNumber: '',
        shortDescription: openAIData.productName || '',
        detailedDescription: '',
        
        // Work costs (corrected by post-processing)
        technicianHours: openAIData.technicianHours || 0,
        hourlyRate: openAIData.hourlyRate || 0,
        workCost: openAIData.workCost || 0,
        overtime50Hours: 0,
        overtime50Cost: 0,
        overtime100Hours: 0,
        overtime100Cost: 0,
        travelTimeHours: openAIData.travelTimeHours || 0,
        travelTimeCost: openAIData.travelTimeCost || 0,
        vehicleKm: openAIData.vehicleKm || 0,
        krPerKm: 0,
        vehicleCost: openAIData.vehicleCost || 0,
        
        // Technician details
        technician: openAIData.technician || '',
        department: '',
        
        // Legacy fields for compatibility
        laborCost: openAIData.workCost || 0,
        partsCost: openAIData.partsCost || 0,
        totalAmount: openAIData.totalAmount || 0,
        evaticJobNumber: openAIData.projectNumber || openAIData.serviceNumber || '',
        confidence: openAIData.confidence || 85
      };
    }
    
    // Check if this is a T. Myhrvold invoice for text parsing
    const isMyhrvoldInvoice = text.includes('T. Myhrvold AS') || 
                             text.includes('Utstyr til næringsmiddelbransjen') ||
                             text.includes('Myhrvold');
    
    if (isMyhrvoldInvoice && file) {
      console.log('Detected T. Myhrvold invoice, using enhanced parser...');
      try {
        const parsedInvoice = await parseMyhrvold(file);
        const warnings = validateMyhrvoldInvoice(parsedInvoice);
        
        if (warnings.length > 0) {
          console.warn('Validation warnings:', warnings);
        }
        
        // Map to ScannedInvoiceData format
        return {
          // Invoice details
          invoiceNumber: parsedInvoice.fakturaNr,
          invoiceDate: parsedInvoice.fakturaDato,
          
          // Customer information
          customerName: 'T. Myhrvold AS',
          customerNumber: parsedInvoice.kundeNr,
          contactPerson: '',
          email: '',
          phone: '',
          address: parsedInvoice.ordreAdresse,
          customerOrgNumber: '',
          
          // Product information
          productName: parsedInvoice.oppdrag?.substring(0, 60) || '',
          productNumber: '',
          productModel: '',
          serialNumber: '',
          msNumber: '',
          shortDescription: parsedInvoice.oppdrag || '',
          detailedDescription: parsedInvoice.beskrivelseUtfort || '',
          
          // Calculate work costs from table data
          technicianHours: parsedInvoice.rows
            .filter(r => r.produktkode === 'T1')
            .reduce((sum, r) => sum + r.antall, 0),
          hourlyRate: parsedInvoice.rows
            .find(r => r.produktkode === 'T1')?.pris || 0,
          workCost: parsedInvoice.rows
            .filter(r => r.produktkode === 'T1')
            .reduce((sum, r) => sum + r.belop, 0),
          overtime50Hours: 0,
          overtime50Cost: 0,
          overtime100Hours: 0,
          overtime100Cost: 0,
          travelTimeHours: parsedInvoice.rows
            .filter(r => r.produktkode === 'RT1')
            .reduce((sum, r) => sum + r.antall, 0),
          travelTimeCost: parsedInvoice.rows
            .filter(r => r.produktkode === 'RT1')
            .reduce((sum, r) => sum + r.belop, 0),
          vehicleKm: parsedInvoice.rows
            .filter(r => r.produktkode.includes('KM') || r.produktkode.includes('Bil'))
            .reduce((sum, r) => sum + r.antall, 0),
          krPerKm: parsedInvoice.rows
            .find(r => r.produktkode.includes('KM') || r.produktkode.includes('Bil'))?.pris || 0,
          vehicleCost: parsedInvoice.rows
            .filter(r => r.produktkode.includes('KM') || r.produktkode.includes('Bil'))
            .reduce((sum, r) => sum + r.belop, 0),
          
          // Technician details
          technician: parsedInvoice.tekniker,
          department: '',
          
          // Legacy fields for compatibility - using enhanced classification
          laborCost: parsedInvoice.arbeidskostnad,
          partsCost: parsedInvoice.delekostnad,
          totalAmount: parsedInvoice.total,
          evaticJobNumber: parsedInvoice.serviceNr || parsedInvoice.prosjektNr,
          confidence: parsedInvoice.confidence
        };
      } catch (error) {
        console.warn('Enhanced parser failed, falling back to regex patterns:', error);
      }
    }
    
    // Fallback to original regex-based parsing
    console.log('Using fallback regex patterns...');
    const patterns = this.getInvoicePatterns();

    const data: ScannedInvoiceData = {
      // Invoice details
      invoiceNumber: this.extractValue(text, patterns.invoiceNumber),
      invoiceDate: this.extractValue(text, patterns.invoiceDate),
      
      // 🏢 KUNDEINFORMASJON (Kritisk - 30%)
      customerName: this.extractCustomer(text),
      customerNumber: this.extractValue(text, patterns.customerNumber),
      contactPerson: this.extractValue(text, patterns.contactPerson),
      email: this.extractValue(text, patterns.email),
      phone: this.extractValue(text, patterns.phone),
      address: this.extractValue(text, patterns.address),
      customerOrgNumber: this.extractValue(text, patterns.customerOrgNumber),
      
      // 🔧 PRODUKTINFORMASJON (Kritisk - 25%)
      productName: this.extractValue(text, patterns.productName) || 'Service/Reparasjon',
      productNumber: this.extractValue(text, patterns.productNumber),
      productModel: this.extractValue(text, patterns.productModel),
      serialNumber: this.extractValue(text, patterns.serialNumber),
      msNumber: this.extractValue(text, patterns.msNumber),
      shortDescription: this.extractValue(text, patterns.shortDescription),
      detailedDescription: this.extractValue(text, patterns.workDescription),
      
      // 💰 ØKONOMISK INFORMASJON (Viktig - 20%)
      technicianHours: this.extractAmount(text, patterns.technicianHours),
      hourlyRate: this.extractAmount(text, patterns.hourlyRate),
      workCost: this.extractAmount(text, patterns.workCost),
      overtime50Hours: 0,
      overtime50Cost: this.extractAmount(text, patterns.overtime50),
      overtime100Hours: 0,
      overtime100Cost: this.extractAmount(text, patterns.overtime100),
      travelTimeHours: 0,
      travelTimeCost: this.extractAmount(text, patterns.travelTime),
      vehicleKm: this.extractAmount(text, patterns.vehicleKm),
      krPerKm: this.extractAmount(text, patterns.krPerKm) || 7.5,
      vehicleCost: this.extractAmount(text, patterns.vehicleCost),
      
      // Technician details
      technician: this.extractValue(text, patterns.technicianName),
      department: '',
      
      // Legacy fields for compatibility
      laborCost: this.extractAmount(text, patterns.laborCost),
      partsCost: this.extractAmount(text, patterns.partsCost),
      totalAmount: this.extractAmount(text, patterns.totalAmount),
      evaticJobNumber: this.extractValue(text, patterns.evaticJobNumber) || this.extractValue(text, patterns.serviceNumber) || this.extractValue(text, patterns.projectNumber),
      confidence: 0
    };

    console.log('Extracted data:', data);

    // 📊 Oppdatert Konfidensberegning (55% minimum)
    let confidence = 0;
    let criticalFieldsScore = 0;
    let supportFieldsScore = 0;
    let bonusScore = 0;

    // Kritiske felt (75%)
    const criticalFields = [
      { field: 'customerName', weight: 20 },
      { field: 'productName', weight: 20 },
      { field: 'serialNumber', weight: 15 },
      { field: 'shortDescription', weight: 10 },
      { field: 'evaticJobNumber', weight: 10 }
    ];

    criticalFields.forEach(({ field, weight }) => {
      const value = data[field as keyof ScannedInvoiceData];
      if (value && value !== '' && value !== 0) {
        criticalFieldsScore += weight;
      }
    });

    // Støttefelt (25%)
    const supportFields = [
      { field: 'totalAmount', weight: 15 },
      { field: 'warrantyStatus', weight: 10 }
    ];

    supportFields.forEach(({ field, weight }) => {
      const value = data[field as keyof ScannedInvoiceData];
      if (value && value !== '' && value !== 0) {
        supportFieldsScore += weight;
      }
    });

    // Bonus triggers (+15%)
    const warrantyMentioned = text.match(patterns.warrantyPeriod || patterns.warrantyStatus);
    const evaticFound = text.match(patterns.evaticJobNumber || patterns.msNumber);
    const serialFound = text.match(patterns.serialNumber);

    if (warrantyMentioned) bonusScore += 5;
    if (evaticFound) bonusScore += 5;
    if (serialFound) bonusScore += 5;

    // Calculate final confidence
    confidence = (criticalFieldsScore + supportFieldsScore + bonusScore) / 100;
    data.confidence = Math.min(confidence, 1); // Cap at 100%

    // 🚨 Generate automatic warnings
    const warnings = this.generateWarnings(data, text);
    if (warnings.length > 0) {
      console.warn('OCR Warnings:', warnings);
    }

    console.log(`OCR Confidence: ${Math.round(data.confidence * 100)}%`);
    return data;
  }

  private static generateWarnings(data: ScannedInvoiceData, text: string): string[] {
    const warnings: string[] = [];

    // ⚠️ Kunde ikke i systemet (would need database check)
    if (!data.customerName) {
      warnings.push('⚠️ Kunde navn ikke funnet');
    }

    // ⚠️ Produkt ikke registrert tidligere
    if (!data.productName || data.productName === 'Service/Reparasjon') {
      warnings.push('⚠️ Spesifikt produkt ikke identifisert');
    }

    // ⚠️ Serienummer mangler/ugyldig
    if (!data.serialNumber) {
      warnings.push('⚠️ Serienummer mangler - kreves for reklamasjon');
    }

    // ⚠️ Jobbreferanse finnes ikke
    if (!data.evaticJobNumber && !data.msNumber) {
      warnings.push('⚠️ Evatic/MS jobbreferanse ikke funnet');
    }

    // ⚠️ Garanti kan være utløpt (basic check)
    const warrantyStatus = text.match(/(?:Utenfor|Utløpt).*garanti/i);
    if (warrantyStatus) {
      warnings.push('⚠️ Garanti kan være utløpt - sjekk garantistatus');
    }

    // Low confidence warning
    if (data.confidence < 0.55) {
      warnings.push('⚠️ Lav sikkerhet - manuell gjennomgang anbefales');
    }

    return warnings;
  }

  public static async processImageWithOpenAI(file: File): Promise<{ text: string; confidence: number }> {
    console.log('Processing image with OpenAI Vision API...');
    
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Call OpenAI Vision API via Edge Function
      const { data, error } = await supabase.functions.invoke('openai-vision-ocr', {
        body: { imageBase64: base64String }
      });
      
      console.log('OpenAI Edge Function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Edge Function error: ${error.message || JSON.stringify(error)}`);
      }
      
      if (!data) {
        throw new Error('No data returned from Edge Function');
      }
      
      if (!data.success) {
        console.error('OpenAI processing failed:', data);
        throw new Error(data.error || 'Failed to process image with OpenAI');
      }
      
      const extractedData = data.data;
      console.log('OpenAI extracted data:', extractedData);
      
      // 🎯 CRITICAL FIX: Correct OpenAI's work classification for T. Myhrvold invoices
      if (extractedData.customerName === 'T. Myhrvold AS') {
        // OpenAI often swaps labor and parts costs - fix this based on invoice structure
        const totalWorkAndParts = (extractedData.workCost || 0) + (extractedData.partsCost || 0);
        
        // Heuristic: Labor (T1) is typically smaller amount than parts on service invoices
        // If workCost > partsCost, they're likely swapped
        if (extractedData.workCost > extractedData.partsCost && extractedData.workCost > 5000) {
          console.log('🔄 Correcting swapped work/parts classification');
          const tempWorkCost = extractedData.workCost;
          extractedData.workCost = extractedData.partsCost;
          extractedData.partsCost = tempWorkCost;
        }
      }
      
      // Return the corrected JSON response as text for parsing
      return {
        text: JSON.stringify(extractedData),
        confidence: (extractedData.confidence || 80) / 100 // Convert to 0-1 range
      };
      
    } catch (error) {
      console.error('OpenAI Vision processing failed:', error);
      throw error;
    }
  }

  public static async processImage(file: File, useOpenAI: boolean = false): Promise<{ text: string; confidence: number }> {
    if (useOpenAI) {
      return this.processImageWithOpenAI(file);
    }
    
    // Process with Tesseract.js - optimized for Norwegian invoices
    const worker = await createWorker(['nor', 'eng'], 1, {
      logger: m => console.log(m)
    });

    // ⚙️ Enhanced OCR parameters for Norwegian claims management
    await worker.setParameters({
      'tessedit_char_whitelist': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅabcdefghijklmnopqrstuvwxyzæøå .,-:/()+%@#&*',
      'preserve_interword_spaces': '1'
    });

    const { data: { text, confidence } } = await worker.recognize(file);
    await worker.terminate();

    console.log('OCR Confidence:', confidence);
    console.log('OCR Text length:', text.length);
    console.log('OCR Text:', text);

    // Parse the invoice with enhanced detection
    const parsedData = await this.parseVismaInvoice(text, file);

    return { 
      text, 
      confidence: parsedData.confidence // Use our calculated confidence
    };
  }
}