import { Tables } from '@/integrations/supabase/types';

// Base types from Supabase
export type User = {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
};

export type Profile = Tables<'profiles'>;
export type Claim = Tables<'claims'>;
export type ClaimTimeline = Tables<'claim_timeline'>;
export type Supplier = Tables<'suppliers'>;
export type SupplierRefundProfile = Tables<'supplier_refund_profiles'>;
export type Notification = Tables<'notifications'>;

// Enums
export type ClaimStatus = Claim['status'];
export type IssueType = Claim['issue_type'];
export type UrgencyLevel = Claim['urgency_level'];
export type Department = Profile['department'];
export type UserRole = Profile['role'];

// Extended types for UI
export interface ClaimWithTimeline extends Claim {
  timeline?: ClaimTimeline[];
}

export interface ClaimListItem {
  id: string;
  claim_number: string;
  customer_name: string;
  product_name: string;
  supplier: string;
  status: ClaimStatus;
  urgency_level: UrgencyLevel;
  created_date: string;
  technician_name: string;
}

export interface ClaimFormData {
  // Customer information
  customerName: string;
  customerNumber: string;
  customerContact: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // Product information
  productName: string;
  productModel: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyPeriod: string;
  supplier: string;
  
  // Issue details
  issueType: IssueType;
  issueDescription: string;
  detailedDescription: string;
  urgencyLevel: UrgencyLevel;
  
  // Business fields
  technicianName: string;
  department: Department;
  evaticJobNumber: string;
  msJobNumber: string;
  
  // Cost breakdown
  workHours: number;
  hourlyRate: number;
  travelHours: number;
  travelDistanceKm: number;
  vehicleCostPerKm: number;
  partsCost: number;
  consumablesCost: number;
  externalServicesCost: number;
  travelCost: number;
  
  // Refund breakdown
  refundedWorkCost: number;
  refundedTravelCost: number;
  refundedVehicleCost: number;
  refundedPartsCost: number;
  refundedOtherCost: number;
  creditNoteNumber: string;
  refundDateReceived: string;
  
  // Refund status
  workCostRefunded: boolean;
  travelCostRefunded: boolean;
  vehicleCostRefunded: boolean;
  partsCostRefunded: boolean;
  otherCostRefunded: boolean;
  
  // Notes
  internalNotes: string;
  customerNotes: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter types
export interface ClaimFilters {
  status?: ClaimStatus[];
  department?: Department[];
  urgencyLevel?: UrgencyLevel[];
  supplier?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

// Form types
export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

// Theme and preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'no' | 'en';
  density: 'compact' | 'comfortable' | 'spacious';
  notifications: {
    email: boolean;
    push: boolean;
    statusUpdates: boolean;
    supplierResponses: boolean;
    overdueAlerts: boolean;
  };
  dashboard: {
    widgets: string[];
    layout: 'grid' | 'list';
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: LoadingState;
  error: AppError | null;
  lastUpdated?: Date;
}