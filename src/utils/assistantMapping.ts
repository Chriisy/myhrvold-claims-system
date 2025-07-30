/**
 * Utility functions for mapping OpenAI Assistant API responses to claim form data
 */

import { ScannedInvoiceData } from '@/types/scanner';

/**
 * Maps OpenAI Assistant extracted data to ScannedInvoiceData format
 */
export function mapAssistantDataToClaimForm(assistantData: any): ScannedInvoiceData {
  console.log('🗺️ Mapping Assistant data to claim form:', assistantData);

  // fillClaimForm mapping as specified in requirements
  const mappedData: ScannedInvoiceData = {
    // Invoice details
    invoiceNumber: assistantData.invoiceNumber || '',
    invoiceDate: assistantData.invoiceDate || '',
    
    // Customer information
    customerName: assistantData.customerName || 'T. Myhrvold AS',
    customerNumber: assistantData.customerNumber || '',
    contactPerson: assistantData.contactPerson || '',
    email: assistantData.email || '',
    phone: assistantData.phone || '',
    address: assistantData.address || '',
    customerOrgNumber: assistantData.customerOrgNumber || '',
    
    // Product information
    productName: assistantData.productName || '',
    productNumber: assistantData.productNumber || assistantData.serviceNumber || '',
    productModel: assistantData.productModel || '',
    serialNumber: assistantData.serialNumber || '',
    msNumber: assistantData.msNumber || assistantData.serviceNumber || '',
    shortDescription: assistantData.productName || '',
    detailedDescription: assistantData.workDescription || assistantData.description || assistantData.productName || '',
    
    // Work costs - mapping from Assistant API
    technicianHours: Number(assistantData.technicianHours || 0),
    hourlyRate: Number(assistantData.hourlyRate || 0),
    workCost: Number(assistantData.workCost || 0), // totals.labour mapping
    
    // Overtime costs (usually not in T. Myhrvold invoices)
    overtime50Hours: Number(assistantData.overtime50Hours || 0),
    overtime50Cost: Number(assistantData.overtime50Cost || 0),
    overtime100Hours: Number(assistantData.overtime100Hours || 0),
    overtime100Cost: Number(assistantData.overtime100Cost || 0),
    
    // Travel costs - mapping from Assistant API
    travelTimeHours: Number(assistantData.travelTimeHours || 0),
    travelTimeCost: Number(assistantData.travelTimeCost || 0), // totals.travel mapping
    
    // Vehicle costs
    vehicleKm: Number(assistantData.vehicleKm || 0),
    krPerKm: Number(assistantData.krPerKm || 0),
    vehicleCost: Number(assistantData.vehicleCost || 0),
    
    // Technician details
    technician: assistantData.technician || '',
    department: assistantData.department || '',
    
    // Legacy fields for compatibility
    laborCost: Number(assistantData.workCost || 0),
    partsCost: Number(assistantData.partsCost || 0), // totals.parts mapping
    totalAmount: Number(assistantData.totalAmount || 0),
    
    // Additional fields
    evaticJobNumber: assistantData.serviceNumber || assistantData.projectNumber || '',
    confidence: Number(assistantData.confidence || 85)
  };

  // Validate total calculation (±2 kr tolerance as specified)
  const calculatedTotal = mappedData.workCost + mappedData.travelTimeCost + 
                         mappedData.vehicleCost + mappedData.partsCost +
                         mappedData.overtime50Cost + mappedData.overtime100Cost;
  
  const totalDiff = Math.abs(calculatedTotal - mappedData.totalAmount);
  
  if (totalDiff > 2) {
    console.warn(`⚠️ Total validation failed for Assistant data. Calculated: ${calculatedTotal}, Extracted: ${mappedData.totalAmount}, Diff: ${totalDiff}`);
    
    // Adjust confidence based on validation failure
    mappedData.confidence = Math.max(50, mappedData.confidence - 20);
  } else {
    console.log('✅ Total validation passed for Assistant data');
  }

  console.log('🎯 Mapped data:', mappedData);
  return mappedData;
}

/**
 * Validates Assistant API response structure
 */
export function validateAssistantResponse(data: any): boolean {
  if (!data) return false;
  
  // Check required fields for T. Myhrvold invoices
  const hasRequiredFields = data.invoiceNumber && 
                           data.customerName &&
                           (data.workCost !== undefined || data.partsCost !== undefined);
  
  // Check that it's a T. Myhrvold invoice
  const isMyhrvoldInvoice = data.customerName === 'T. Myhrvold AS' ||
                           (data.invoiceNumber && data.invoiceNumber.length >= 7);
  
  return hasRequiredFields && isMyhrvoldInvoice;
}

/**
 * Creates line items from Assistant API rows data
 */
export function mapAssistantRowsToLineItems(rows: any[]): any[] {
  if (!Array.isArray(rows)) return [];
  
  return rows.map((row, index) => ({
    id: index + 1,
    description: row.description || '',
    quantity: Number(row.quantity || 1),
    unitPrice: Number(row.unitPrice || 0),
    totalPrice: Number(row.totalPrice || 0),
    code: row.code || '',
    category: row.code === 'T1' ? 'labor' : 
              row.code === 'RT1' ? 'travel' :
              row.code === 'KM' ? 'vehicle' : 'parts'
  }));
}