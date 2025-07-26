export interface InvoiceDetails {
  invoiceNumber: string;
  invoiceDate: string;
}

export interface CustomerInformation {
  customerName: string;
  customerNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  customerOrgNumber: string;
}

export interface ProductInformation {
  productName: string;
  productNumber: string;
  productModel: string;
  serialNumber: string;
  msNumber: string;
  shortDescription: string;
  detailedDescription: string;
}

export interface WorkCosts {
  technicianHours: number;
  hourlyRate: number;
  workCost: number;
  overtime50Hours: number;
  overtime50Cost: number;
  overtime100Hours: number;
  overtime100Cost: number;
  travelTimeHours: number;
  travelTimeCost: number;
  vehicleKm: number;
  krPerKm: number;
  vehicleCost: number;
}

export interface TechnicianDetails {
  technician: string;
  department: string;
}

export interface ScannedInvoiceData extends InvoiceDetails, CustomerInformation, ProductInformation, WorkCosts, TechnicianDetails {
  // Legacy fields for compatibility
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  evaticJobNumber?: string;
  confidence: number;
}

export interface InvoiceScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: ScannedInvoiceData) => void;
}