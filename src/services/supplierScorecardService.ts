import { supabase } from "@/integrations/supabase/client";

export interface SupplierScorecard {
  supplier_name: string;
  total_claims: number;
  active_claims: number;
  resolved_claims: number;
  avg_response_time_days: number;
  total_cost: number;
  total_refunded: number;
  refund_rate: number;
  score: number;
}

export const supplierScorecardService = {
  // Get all supplier scorecards
  async getSupplierScorecards(): Promise<SupplierScorecard[]> {
    const { data, error } = await supabase.rpc('calculate_supplier_scorecards');
    
    if (error) throw error;
    return data || [];
  },

  // Get scorecard for specific supplier
  async getSupplierScorecard(supplierName: string): Promise<SupplierScorecard | null> {
    const scorecards = await this.getSupplierScorecards();
    return scorecards.find(s => s.supplier_name === supplierName) || null;
  },

  // Get top/bottom performing suppliers
  async getTopSuppliers(limit = 5): Promise<SupplierScorecard[]> {
    const scorecards = await this.getSupplierScorecards();
    return scorecards.slice(0, limit);
  },

  async getBottomSuppliers(limit = 5): Promise<SupplierScorecard[]> {
    const scorecards = await this.getSupplierScorecards();
    return scorecards.slice(-limit).reverse();
  }
};