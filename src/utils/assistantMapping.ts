/**
 * Utility functions for mapping OpenAI Assistant API responses to claim form data
 */

import { ScannedInvoiceData } from '@/types/scanner';

// Invoice JSON structure from Assistant API
export interface InvoiceJSON {
  invoiceNumber?: string;
  shortDesc?: string;
  longDesc?: string;
  technician?: string;
  totals?: {
    labour?: number;
    travel?: number;
    parts?: number;
    grandTotal?: number;
  };
  rows?: Array<{
    code?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  }>;
  // Additional fields for compatibility
  customerName?: string;
  invoiceDate?: string;
  serviceNo?: string;
  projectNo?: string;
  confidence?: number;
}

/**
 * Maps InvoiceJSON structure to ClaimForm (ScannedInvoiceData)
 */
export function map(json: InvoiceJSON): ScannedInvoiceData {

  // Fallback check - throw ASSIST_FAIL if totals are missing
  if (!json.totals) {
    console.error('❌ ASSIST_FAIL: Missing totals in InvoiceJSON');
    throw new Error('ASSIST_FAIL: Missing required totals data');
  }

  const mappedData: ScannedInvoiceData = {
    // Invoice details
    invoiceNumber: json.invoiceNumber || '',
    invoiceDate: json.invoiceDate || '',
    
    // Customer information (defaults for T. Myhrvold)
    customerName: json.customerName || 'T. Myhrvold AS',
    customerNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    customerOrgNumber: '',
    
    // Product information
    productName: '',
    productNumber: json.serviceNo || '',
    productModel: '',
    serialNumber: '',
    msNumber: json.serviceNo || '',
    shortDescription: json.shortDesc || '',
    detailedDescription: json.longDesc || '',
    
    // Work costs - mapped from totals.labour
    workCost: Number(json.totals.labour || 0),
    technicianHours: 0, // Will be calculated if hourlyRate is available
    hourlyRate: 0,
    
    // Overtime costs (usually not in T. Myhrvold invoices)
    overtime50Hours: 0,
    overtime50Cost: 0,
    overtime100Hours: 0,
    overtime100Cost: 0,
    
    // Travel costs - mapped from totals.travel
    travelTimeHours: 0, // Will be calculated if needed
    travelTimeCost: Number(json.totals.travel || 0),
    
    // Vehicle costs
    vehicleKm: 0,
    krPerKm: 0,
    vehicleCost: 0,
    
    // Parts cost - mapped from totals.parts
    partsCost: Number(json.totals.parts || 0),
    
    // Technician details
    technician: json.technician || '',
    department: '',
    
    // Total amount
    totalAmount: Number(json.totals.grandTotal || 0),
    
    // Legacy fields for compatibility
    laborCost: Number(json.totals.labour || 0),
    
    // Additional fields
    evaticJobNumber: json.serviceNo || json.projectNo || '',
    confidence: Number(json.confidence || 85)
  };

  // Validate total calculation (±2 kr tolerance as specified)
  const calculatedTotal = mappedData.workCost + mappedData.travelTimeCost + 
                         mappedData.vehicleCost + mappedData.partsCost +
                         mappedData.overtime50Cost + mappedData.overtime100Cost;
  
  const totalDiff = Math.abs(calculatedTotal - mappedData.totalAmount);
  
  if (totalDiff > 2) {
    console.warn(`⚠️ Total validation failed. Calculated: ${calculatedTotal}, Extracted: ${mappedData.totalAmount}, Diff: ${totalDiff}`);
    mappedData.confidence = Math.max(50, mappedData.confidence - 20);
  }

  return mappedData;
}

/**
 * Validates InvoiceJSON response structure
 */
export function validateInvoiceJSON(data: InvoiceJSON): boolean {
  if (!data) return false;
  
  // Check required fields for T. Myhrvold invoices
  const hasRequiredFields = data.invoiceNumber && 
                           data.totals &&
                           (data.totals.labour !== undefined || 
                            data.totals.travel !== undefined || 
                            data.totals.parts !== undefined);
  
  // Check that it's a T. Myhrvold invoice
  const isMyhrvoldInvoice = data.customerName === 'T. Myhrvold AS' ||
                           (data.invoiceNumber && data.invoiceNumber.length >= 7);
  
  return hasRequiredFields && isMyhrvoldInvoice;
}

/**
 * Legacy validation function for backwards compatibility
 * @deprecated Use validateInvoiceJSON() instead
 */
export function validateAssistantResponse(data: any): boolean {
  return validateInvoiceJSON(data);
}

/**
 * Legacy function for backwards compatibility
 * Maps OpenAI Assistant extracted data to ScannedInvoiceData format
 * @deprecated Use map() function with InvoiceJSON instead
 */
export function mapAssistantDataToClaimForm(assistantData: any): ScannedInvoiceData {
  
  // Convert legacy format to InvoiceJSON format
  const invoiceJSON: InvoiceJSON = {
    invoiceNumber: assistantData.invoiceNumber,
    shortDesc: assistantData.productName || assistantData.description,
    longDesc: assistantData.workDescription || assistantData.detailedDescription,
    technician: assistantData.technician,
    totals: {
      labour: assistantData.workCost || assistantData.laborCost,
      travel: assistantData.travelTimeCost || assistantData.travelCost,
      parts: assistantData.partsCost,
      grandTotal: assistantData.totalAmount
    },
    customerName: assistantData.customerName,
    invoiceDate: assistantData.invoiceDate,
    serviceNo: assistantData.serviceNumber || assistantData.evaticJobNumber,
    projectNo: assistantData.projectNumber,
    confidence: assistantData.confidence
  };
  
  return map(invoiceJSON);
}

/**
 * Creates line items from InvoiceJSON rows data
 * Filters out non-parts rows (rows where code != labor/travel codes)
 */
export function mapInvoiceRowsToLineItems(rows: any[]): any[] {
  if (!Array.isArray(rows)) return [];
  
  // Filter out labor/travel rows, keep only parts
  const partsRows = rows.filter(row => 
    row.code && 
    !['T1', 'RT1', 'KM'].includes(row.code.toUpperCase())
  );
  
  return partsRows.map((row, index) => ({
    id: index + 1,
    description: row.description || '',
    quantity: Number(row.quantity || 1),
    unitPrice: Number(row.unitPrice || 0),
    totalPrice: Number(row.totalPrice || 0),
    code: row.code || '',
    category: 'parts'
  }));
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use mapInvoiceRowsToLineItems() instead
 */
export function mapAssistantRowsToLineItems(rows: any[]): any[] {
  return mapInvoiceRowsToLineItems(rows);
}

/**
 * Trims OCR text before sending to Assistant API
 */
export function trimOCRText(ocrText: string): string {
  if (!ocrText) return '';
  
  return ocrText
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .slice(0, 8000); // Limit to reasonable length for API
}
