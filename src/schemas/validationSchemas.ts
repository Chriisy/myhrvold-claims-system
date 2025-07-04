// Simplified validation schemas to avoid zod version conflicts
export interface ClaimFormValidation {
  customerName: string;
  customerNumber: string;
  customerContact?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  
  productName: string;
  productModel?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyPeriod?: string;
  supplier: string;
  
  issueType: 'warranty' | 'claim' | 'service_callback' | 'extended_warranty';
  issueDescription: string;
  detailedDescription?: string;
  urgencyLevel: 'low' | 'normal' | 'high' | 'critical';
  
  technicianName: string;
  department: 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet';
  evaticJobNumber?: string;
  msJobNumber?: string;
  
  workHours: number;
  hourlyRate: number;
  travelHours: number;
  travelDistanceKm: number;
  vehicleCostPerKm: number;
  partsCost: number;
  consumablesCost: number;
  externalServicesCost: number;
  travelCost: number;
  
  refundedWorkCost: number;
  refundedTravelCost: number;
  refundedVehicleCost: number;
  refundedPartsCost: number;
  refundedOtherCost: number;
  creditNoteNumber?: string;
  refundDateReceived?: string;
  
  workCostRefunded: boolean;
  travelCostRefunded: boolean;
  vehicleCostRefunded: boolean;
  partsCostRefunded: boolean;
  otherCostRefunded: boolean;
  
  internalNotes?: string;
  customerNotes?: string;
}

export interface SupplierEmailFormData {
  supplierEmail: string;
  language: 'no' | 'en';
}

// Simple validation functions instead of zod schemas
export const validateClaimForm = (data: Partial<ClaimFormValidation>): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required fields
  if (!data.customerName?.trim()) {
    errors.customerName = "Kundenavn er påkrevd";
  }
  
  if (!data.customerNumber?.trim()) {
    errors.customerNumber = "Kundenummer er påkrevd";
  }
  
  if (!data.productName?.trim()) {
    errors.productName = "Produktnavn er påkrevd";
  }
  
  if (!data.supplier?.trim()) {
    errors.supplier = "Leverandør er påkrevd";
  }
  
  if (!data.issueType) {
    errors.issueType = "Type problem er påkrevd";
  }
  
  if (!data.issueDescription?.trim() || data.issueDescription.length < 10) {
    errors.issueDescription = "Problembeskrivelse må være minst 10 tegn";
  }
  
  if (!data.technicianName?.trim()) {
    errors.technicianName = "Tekniker navn er påkrevd";
  }
  
  if (!data.department) {
    errors.department = "Avdeling er påkrevd";
  }

  // Email validation
  if (data.customerEmail && data.customerEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.customerEmail)) {
      errors.customerEmail = "Ugyldig e-postadresse";
    }
  }

  // Job number validation - at least one required
  if (!data.evaticJobNumber?.trim() && !data.msJobNumber?.trim()) {
    errors.evaticJobNumber = "Enten Evatic jobbnummer eller MS-nummer må fylles ut";
  }

  // Numeric validations
  if (data.workHours !== undefined && data.workHours < 0) {
    errors.workHours = "Arbeidstimer kan ikke være negativ";
  }
  
  if (data.hourlyRate !== undefined && data.hourlyRate < 0) {
    errors.hourlyRate = "Timelønn kan ikke være negativ";
  }

  // Refund validation
  if (data.workHours && data.hourlyRate && data.refundedWorkCost !== undefined) {
    const workCost = data.workHours * data.hourlyRate;
    if (data.refundedWorkCost > workCost) {
      errors.refundedWorkCost = "Refundert arbeid kan ikke overstige arbeidskostnad";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateSupplierEmail = (data: Partial<SupplierEmailFormData>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};

  if (!data.supplierEmail?.trim()) {
    errors.supplierEmail = "E-postadresse er påkrevd";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.supplierEmail)) {
      errors.supplierEmail = "Ugyldig e-postadresse";
    }
  }

  if (!data.language) {
    errors.language = "Språk er påkrevd";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};