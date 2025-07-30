import { createWorker, PSM, type Worker } from 'tesseract.js';

interface InvoiceRow {
  produktkode: string;
  beskrivelse: string;
  antall: number;
  pris: number;
  belop: number;
}

interface ParsedInvoice {
  fakturaNr: string;
  fakturaDato: string;
  serviceNr: string;
  prosjektNr: string;
  kundeNr: string;
  ordreNr: string;
  ordreAdresse: string;
  oppdrag: string;
  beskrivelseUtfort: string;
  tekniker: string;
  total: number;
  rows: InvoiceRow[];
  // Enhanced work classification
  arbeidskostnad: number;
  delekostnad: number;
  reisekostnad: number;
  confidence: number;
}

interface ProcessedImage {
  buffer: ArrayBuffer;
  width: number;
  height: number;
}

// Pre-processing pipeline using Canvas API (browser-compatible)
async function preprocessImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // High DPI rendering
      const scale = 2; // 2x for better quality
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Draw with high quality
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to grayscale and apply threshold
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Apply threshold (180 = remove blue logo noise)
        const threshold = gray > 180 ? 255 : 0;
        
        data[i] = threshold;     // Red
        data[i + 1] = threshold; // Green
        data[i + 2] = threshold; // Blue
        // Alpha stays the same
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not convert canvas to blob'));
          return;
        }
        
        blob.arrayBuffer().then(buffer => {
          resolve({
            buffer,
            width: canvas.width,
            height: canvas.height
          });
        });
      }, 'image/png');
    };
    
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Enhanced column splitting that handles discount columns robustly
function splitCols(raw: string): string[] {
  const cols = raw.trim().split(/\s{2,}/).filter(col => col.trim());
  
  // If we get 6 columns, assume discount column exists at position -3 (remove it)
  if (cols.length === 6) {
    // Remove discount column (typically "35 %" or similar)
    const discountIndex = cols.findIndex(col => col.match(/^\d+\s*%$/));
    if (discountIndex !== -1) {
      cols.splice(discountIndex, 1);
    } else {
      // Fallback: remove third-to-last column
      cols.splice(-3, 1);
    }
  }
  
  return cols;
}

// Parse table rows with robust column detection and work classification
function parseTableRows(text: string): InvoiceRow[] {
  const rows: InvoiceRow[] = [];
  
  text.split('\n')
    .filter(line => line.match(/\s{2,}/)) // Lines with at least 2 spaces = table rows
    .forEach(raw => {
      const line = raw.trim();
      if (!line || line.length < 10) return;
      
      // Use enhanced column splitting
      const cols = splitCols(line);
      if (cols.length < 4) return;
      
      const [produktkode, ...rest] = cols;
      
      // Skip header rows
      if (produktkode.match(/^(produktnr|beskrivelse|antall|pris|beløp)/i)) return;
      
      // Last three columns: antall, pris, beløp
      const belopStr = rest.at(-1)?.replace(/\s/g, '').replace(',', '.') || '0';
      const prisStr = rest.at(-2)?.replace(/\s/g, '').replace(',', '.') || '0';
      const antallStr = rest.at(-3)?.replace(',', '.') || '0';
      
      const belop = Number(belopStr) || 0;
      const pris = Number(prisStr) || 0;
      const antall = Number(antallStr) || 0;
      
      // Everything else is description
      const beskrivelse = rest.slice(0, -3).join(' ').trim();
      
      if (produktkode && (belop > 0 || pris > 0)) {
        rows.push({ produktkode, beskrivelse, antall, pris, belop });
      }
    });
  
  return rows;
}

// Enhanced confidence calculation with work classification
function calculateConfidence(invoice: ParsedInvoice): number {
  let score = 0;
  let maxScore = 0;
  
  // Critical fields (high weight)
  if (invoice.fakturaNr && invoice.fakturaNr.length >= 6) score += 20;
  maxScore += 20;
  
  if (invoice.fakturaDato && invoice.fakturaDato.match(/\d{2}\.\d{2}\.\d{4}/)) score += 15;
  maxScore += 15;
  
  if (invoice.total > 0) score += 15;
  maxScore += 15;
  
  // Supporting fields (medium weight)
  if (invoice.serviceNr) score += 10;
  maxScore += 10;
  
  if (invoice.prosjektNr) score += 10;
  maxScore += 10;
  
  if (invoice.tekniker) score += 10;
  maxScore += 10;
  
  if (invoice.oppdrag) score += 10;
  maxScore += 10;
  
  // Table data and work classification (enhanced scoring)
  if (invoice.rows.length > 0) score += 5;
  maxScore += 5;
  
  // Check for proper work classification
  const hasLabor = invoice.rows.some(r => r.produktkode.startsWith('T1'));
  const hasParts = invoice.rows.some(r => !r.produktkode.startsWith('T1') && !r.produktkode.startsWith('RT1') && r.produktkode !== 'KM');
  
  if (hasLabor) score += 5;
  maxScore += 5;
  
  if (hasParts || hasLabor) score += 5;
  maxScore += 5;
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

export async function parseMyhrvold(file: File): Promise<ParsedInvoice> {
  try {
    console.log('Starting Myhrvold parser with enhanced preprocessing...');
    
    // ---------- 1) PRE-PROCESS ----------
    const processedImage = await preprocessImage(file);
    
    // ---------- 2) OCR with optimized settings ----------
    const worker: Worker = await createWorker(['nor', 'eng']);
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅabcdefghijklmnopqrstuvwxyzæøå .,-:/()+%',
      preserve_interword_spaces: '1',
      user_defined_dpi: '350'
    });
    
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    
    console.log('OCR text extracted:', text.substring(0, 500) + '...');
    
    // ---------- 3) EXTRACT HEADER FIELDS ----------
    const grab = (re: RegExp) => {
      const match = text.match(re);
      return match?.[1]?.trim() || '';
    };
    
    const fakturaNr = grab(/(?:Faktura|FAKTURA)\s*(?:Nr\.?\s*)?(\d{6,})/i) || 
                     grab(/Nr\.\s*(\d{6,})/);
    
    const fakturaDato = grab(/Fakturadato:\s*(\d{2}\.\d{2}\.\d{4})/i);
    
    const serviceNr = grab(/Service\s*nr:?\s*(\d+)/i);
    
    const prosjektNr = grab(/Prosjekt\s*nr:?\s*(\d+)/i);
    
    const kundeNr = grab(/Kundenr\.?:\s*(\d+)/i);
    
    const ordreNr = grab(/Ordrenr\.?:\s*(\d+)/i);
    
    const ordreAdresse = grab(/Ordreadresse:\s*(.+?)(?=\n|$)/i);
    
    const oppdrag = grab(/Oppdrag:\s*(.+?)(?=\n\n|\n[A-Z]|$)/is);
    
    const beskrivelseUtfort = grab(/(?:Beskrivelse utført|Jobb utført):\s*([\s\S]+?)(?=\n[A-ZÆØÅ]{3,}|$)/i);
    
    const tekniker = grab(/Tekniker:\s*(.+?)(?=\n|$)/i);
    
    // Total amount with multiple patterns
    const totalStr = grab(/(?:Total|Ordresum|Sum)\s*(?:eks\.?\s*mva\.?)?\s*:\s*([\d\s.,]+)/i) ||
                    grab(/(?:Total|Sum)\s+avgiftsfritt\s+([\d\s.,]+)/i);
    
    const total = totalStr ? Number(totalStr.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
    
    // ---------- 4) PARSE TABLE ROWS ----------
    const rows = parseTableRows(text);
    
    // ---------- 5) CLASSIFY WORK TYPES ----------
    const laborRows = rows.filter(r => r.produktkode.startsWith('T1'));
    const travelRows = rows.filter(r => r.produktkode.startsWith('RT1') || r.produktkode === 'KM');
    const partsRows = rows.filter(r => !r.produktkode.startsWith('T1') && !r.produktkode.startsWith('RT1') && r.produktkode !== 'KM');
    
    const arbeidskostnad = laborRows.reduce((sum, row) => sum + row.belop, 0);
    const reisekostnad = travelRows.reduce((sum, row) => sum + row.belop, 0);
    const delekostnad = partsRows.reduce((sum, row) => sum + row.belop, 0);
    
    console.log('Work classification:', {
      labor: { count: laborRows.length, cost: arbeidskostnad },
      travel: { count: travelRows.length, cost: reisekostnad },
      parts: { count: partsRows.length, cost: delekostnad }
    });
    
    const invoice: ParsedInvoice = {
      fakturaNr,
      fakturaDato,
      serviceNr,
      prosjektNr,
      kundeNr,
      ordreNr,
      ordreAdresse,
      oppdrag,
      beskrivelseUtfort,
      tekniker,
      total,
      rows,
      arbeidskostnad,
      delekostnad,
      reisekostnad,
      confidence: 0 // Will be calculated below
    };
    
    // Calculate confidence score
    invoice.confidence = calculateConfidence(invoice);
    
    console.log('Parsed invoice:', {
      fakturaNr: invoice.fakturaNr,
      total: invoice.total,
      rowCount: invoice.rows.length,
      confidence: invoice.confidence
    });
    
    return invoice;
    
  } catch (error) {
    console.error('Error in Myhrvold parser:', error);
    throw new Error(`OCR parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Validation helpers
export function validateMyhrvoldInvoice(invoice: ParsedInvoice): string[] {
  const warnings: string[] = [];
  
  // Plausibility checks
  const calculatedTotal = invoice.rows.reduce((sum, row) => sum + row.belop, 0);
  if (Math.abs(calculatedTotal - invoice.total) > 1) {
    warnings.push(`Total stemmer ikke: ${invoice.total} vs beregnet ${calculatedTotal}`);
  }
  
  // Date validation
  if (invoice.fakturaDato) {
    const [day, month, year] = invoice.fakturaDato.split('.');
    const invoiceDate = new Date(Number(year), Number(month) - 1, Number(day));
    if (invoiceDate > new Date()) {
      warnings.push('Fakturadato er i fremtiden');
    }
  }
  
  // Critical fields
  if (!invoice.fakturaNr) warnings.push('Fakturanummer mangler');
  if (!invoice.total || invoice.total <= 0) warnings.push('Totalbeløp mangler eller ugyldig');
  if (!invoice.tekniker) warnings.push('Tekniker mangler');
  
  // Project number validation
  if (invoice.prosjektNr && Number(invoice.prosjektNr) < 100000) {
    warnings.push('Prosjektnummer ser ufullstendig ut');
  }
  
  return warnings;
}