import { validateEmail, validateNorwegianName, validatePhone, validateOrgNumber, sanitizeInput } from "@/utils/security";

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

// Enhanced validation functions with security utilities
export const validateClaimForm = (data: Partial<ClaimFormValidation>): { 
  isValid: boolean; 
  errors: Record<string, string>; 
} => {
  const errors: Record<string, string> = {};

  // Required field validations with sanitization
  if (!data.customerName?.trim()) {
    errors.customerName = "Kundenavn er påkrevd";
  } else if (!validateNorwegianName(data.customerName)) {
    errors.customerName = "Kundenavn inneholder ugyldige tegn";
  }
  
  if (!data.customerNumber?.trim()) {
    errors.customerNumber = "Kundenummer er påkrevd";
  } else {
    // Validate customer number format (alphanumeric + some special chars)
    const customerNumRegex = /^[a-zA-Z0-9\-_\.]{1,20}$/;
    if (!customerNumRegex.test(data.customerNumber)) {
      errors.customerNumber = "Kundenummer kan kun inneholde bokstaver, tall, bindestrek, understrek og punktum";
    }
  }
  
  if (!data.productName?.trim()) {
    errors.productName = "Produktnavn er påkrevd";
  } else if (data.productName.length > 100) {
    errors.productName = "Produktnavn kan ikke være lenger enn 100 tegn";
  }
  
  if (!data.supplier?.trim()) {
    errors.supplier = "Leverandør er påkrevd";
  } else if (data.supplier.length > 100) {
    errors.supplier = "Leverandørnavn kan ikke være lenger enn 100 tegn";
  }
  
  if (!data.issueType) {
    errors.issueType = "Type problem er påkrevd";
  }
  
  // Enhanced issue description validation
  if (!data.issueDescription?.trim()) {
    errors.issueDescription = "Problembeskrivelse er påkrevd";
  } else if (data.issueDescription.length < 10) {
    errors.issueDescription = "Problembeskrivelse må være minst 10 tegn";
  } else if (data.issueDescription.length > 1000) {
    errors.issueDescription = "Problembeskrivelse kan ikke være lenger enn 1000 tegn";
  }
  
  // Technician name validation
  if (!data.technicianName?.trim()) {
    errors.technicianName = "Tekniker navn er påkrevd";
  } else if (!validateNorwegianName(data.technicianName)) {
    errors.technicianName = "Tekniker navn inneholder ugyldige tegn";
  }
  
  if (!data.department) {
    errors.department = "Avdeling er påkrevd";
  }

  // Enhanced email validation using security utility
  if (data.customerEmail && data.customerEmail.trim()) {
    if (!validateEmail(data.customerEmail)) {
      errors.customerEmail = "Ugyldig e-postadresse";
    }
  }

  // Enhanced phone validation using security utility
  if (data.customerPhone && data.customerPhone.trim()) {
    if (!validatePhone(data.customerPhone)) {
      errors.customerPhone = "Ugyldig telefonnummer";
    }
  }

  // Job number validation - at least one required and format check
  if (!data.evaticJobNumber?.trim() && !data.msJobNumber?.trim()) {
    errors.evaticJobNumber = "Enten Evatic jobbnummer eller MS-nummer må fylles ut";
  } else {
    // Validate job number formats
    if (data.evaticJobNumber && data.evaticJobNumber.trim()) {
      const evaticRegex = /^[a-zA-Z0-9\-_]{1,20}$/;
      if (!evaticRegex.test(data.evaticJobNumber)) {
        errors.evaticJobNumber = "Evatic jobbnummer har ugyldig format";
      }
    }
    if (data.msJobNumber && data.msJobNumber.trim()) {
      const msRegex = /^[a-zA-Z0-9\-_]{1,20}$/;
      if (!msRegex.test(data.msJobNumber)) {
        errors.msJobNumber = "MS-nummer har ugyldig format";
      }
    }
  }

  // Enhanced numeric validations with range checks
  if (data.workHours !== undefined) {
    if (data.workHours < 0) {
      errors.workHours = "Arbeidstimer kan ikke være negativ";
    } else if (data.workHours > 168) { // Max 168 hours per week
      errors.workHours = "Arbeidstimer kan ikke overstige 168 timer";
    }
  }
  
  if (data.hourlyRate !== undefined) {
    if (data.hourlyRate < 0) {
      errors.hourlyRate = "Timelønn kan ikke være negativ";
    } else if (data.hourlyRate > 5000) { // Reasonable upper limit
      errors.hourlyRate = "Timelønn kan ikke overstige 5000 kr/time";
    }
  }

  // Travel validation
  if (data.travelHours !== undefined && data.travelHours < 0) {
    errors.travelHours = "Reisetimer kan ikke være negativ";
  }
  
  if (data.travelDistanceKm !== undefined) {
    if (data.travelDistanceKm < 0) {
      errors.travelDistanceKm = "Reiseavstand kan ikke være negativ";
    } else if (data.travelDistanceKm > 10000) { // Reasonable limit
      errors.travelDistanceKm = "Reiseavstand kan ikke overstige 10000 km";
    }
  }

  // Enhanced refund validation with comprehensive checks
  if (data.workHours && data.hourlyRate && data.refundedWorkCost !== undefined) {
    const workCost = data.workHours * data.hourlyRate;
    if (data.refundedWorkCost > workCost) {
      errors.refundedWorkCost = "Refundert arbeid kan ikke overstige arbeidskostnad";
    }
    if (data.refundedWorkCost < 0) {
      errors.refundedWorkCost = "Refundert beløp kan ikke være negativt";
    }
  }

  // Validate all refunded amounts are non-negative
  const refundFields = ['refundedWorkCost', 'refundedTravelCost', 'refundedVehicleCost', 'refundedPartsCost', 'refundedOtherCost'] as const;
  refundFields.forEach(field => {
    if (data[field] !== undefined && data[field]! < 0) {
      errors[field] = "Refundert beløp kan ikke være negativt";
    }
  });

  // Notes validation (length limits and sanitization check)
  if (data.internalNotes && data.internalNotes.length > 2000) {
    errors.internalNotes = "Interne notater kan ikke være lenger enn 2000 tegn";
  }
  
  if (data.customerNotes && data.customerNotes.length > 2000) {
    errors.customerNotes = "Kundenotater kan ikke være lenger enn 2000 tegn";
  }

  if (data.detailedDescription && data.detailedDescription.length > 2000) {
    errors.detailedDescription = "Detaljert beskrivelse kan ikke være lenger enn 2000 tegn";
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
  } else if (!validateEmail(data.supplierEmail)) {
    errors.supplierEmail = "Ugyldig e-postadresse";
  }

  if (!data.language) {
    errors.language = "Språk er påkrevd";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitizes form data to prevent XSS and other injection attacks
 */
export const sanitizeClaimFormData = (data: Partial<ClaimFormValidation>): Partial<ClaimFormValidation> => {
  const sanitized = { ...data };
  
  // Sanitize text fields
  const textFields = [
    'customerName', 'customerNumber', 'customerContact', 'customerEmail', 
    'customerPhone', 'customerAddress', 'productName', 'productModel', 
    'serialNumber', 'supplier', 'issueDescription', 'detailedDescription',
    'technicianName', 'evaticJobNumber', 'msJobNumber', 'creditNoteNumber',
    'internalNotes', 'customerNotes'
  ] as const;
  
  textFields.forEach(field => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field] as string);
    }
  });
  
  return sanitized;
};