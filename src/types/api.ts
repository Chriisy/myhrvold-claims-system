// TypeScript interfaces for better type safety

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface ClaimAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  path?: string; // Storage path for deletion
  [key: string]: any; // Allow additional properties for Supabase JSON compatibility
}

export interface CustomLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'parts' | 'labor' | 'travel' | 'other';
}

export interface DashboardClaim {
  id: string;
  claim_number: string;
  customer_name: string;
  product_name: string;
  supplier: string;
  status: string;
  created_date: string;
  updated_date?: string;
  total_cost?: number;
  total_refunded?: number;
  expected_refund?: number;
  actual_refund?: number;
  net_cost?: number;
  department: string;
  urgency_level: string;
  technician_name: string;
  supplier_email_sent_date?: string;
  refund_date_received?: string;
  refund_status?: string;
  product_model?: string;
}

export interface DepartmentStats {
  department: string;
  total: number;
  pending: number;
  resolved: number;
  percentage?: number;
  avgCost?: number;
}

export interface SupplierCost {
  supplier: string;
  totalCost: number;
  refunded: number;
  pending: number;
  claimCount: number;
}

export interface ProductCost {
  product: string;
  totalCost: number;
  refunded: number;
  claimCount: number;
}

export interface WeeklyTrend {
  week: string;
  claims: number;
  costs: number;
  refunds: number;
}

export interface RefundAnalysis {
  totalCost: number;
  totalRefunded: number;
  pendingRefunds: number;
  refundRate: number;
}

export interface CostTrend {
  month: string;
  cost: number;
  refund: number;
}

export interface SupplierData {
  id: string;
  name: string;
  email?: string;
  contact_person?: string;
  phone?: string;
  is_active: boolean;
}

export interface PartData {
  id: string;
  part_number: string;
  description: string;
  unit_price: number;
  supplier_name?: string;
  category?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface CustomerData {
  id: string;
  customer_name: string;
  customer_number: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export interface AutocompleteItem {
  id: string;
  label: string;
  value: string;
  data?: Record<string, any>;
}

export interface BulkOperationItem {
  id: string;
  data: Record<string, any>;
  selected?: boolean;
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | null | undefined;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

export interface QueryFilters {
  status?: string[];
  department?: string[];
  supplier?: string[];
  urgency_level?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationData {
  id: string;
  user_id: string;
  claim_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  scheduled_for?: string;
  metadata?: Record<string, any>;
}

export interface BudgetFormData {
  year: number;
  target_amount: number;
  department?: string | null;
  supplier_name?: string | null;
  notes?: string | null;
}