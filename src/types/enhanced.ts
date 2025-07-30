// Enhanced TypeScript interfaces to replace 'any' types

export interface NotificationMetadata {
  claimId?: string;
  severity?: 'low' | 'medium' | 'high';
  source?: string;
  [key: string]: any;
}

export interface ClaimFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface CustomLineItem {
  id?: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  code?: string;
  category: 'parts' | 'labor' | 'travel' | 'other';
}

export interface SupplierRefundProfile {
  supplier_name: string;
  refunds_work: boolean;
  refunds_parts: boolean;
  refunds_travel: boolean;
  refunds_vehicle: boolean;
  travel_limit_km?: number;
  notes?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  workCost?: number;
  partsCost?: number;
  travelCost?: number;
  totalAmount?: number;
  supplierName?: string;
  invoiceNumber?: string;
  productName?: string;
  technician?: string;
  workDescription?: string;
  laborCost?: number;
  travelTimeCost?: number;
  vehicleCost?: number;
}

export interface FormUpdateData {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export interface ErrorContext {
  action?: string;
  component?: string;
  userId?: string;
  claimId?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface TableData {
  id: string;
  [key: string]: any;
}

export interface FilterCriteria {
  [key: string]: string | number | boolean | string[] | null | undefined;
}