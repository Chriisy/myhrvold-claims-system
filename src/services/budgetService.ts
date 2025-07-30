import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type BudgetTarget = Database['public']['Tables']['budget_targets']['Row'];
export type BudgetTargetInsert = Database['public']['Tables']['budget_targets']['Insert'];
export type BudgetTargetUpdate = Database['public']['Tables']['budget_targets']['Update'];

export interface BudgetProgress {
  target_amount: number;
  actual_refunded: number;
  progress_percentage: number;
  remaining_amount: number;
}

export const budgetService = {
  // Get all budget targets
  async getBudgetTargets(): Promise<BudgetTarget[]> {
    const { data, error } = await supabase
      .from('budget_targets')
      .select('*')
      .order('year', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get budget targets for specific year
  async getBudgetTargetsByYear(year: number): Promise<BudgetTarget[]> {
    const { data, error } = await supabase
      .from('budget_targets')
      .select('*')
      .eq('year', year)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get budget progress using the database function
  async getBudgetProgress(
    year: number, 
    department?: Database['public']['Enums']['department'], 
    supplierName?: string
  ): Promise<BudgetProgress> {
    const { data, error } = await supabase.rpc('get_budget_progress', {
      p_year: year,
      p_department: department || null,
      p_supplier_name: supplierName || null
    });
    
    if (error) throw error;
    return data?.[0] || {
      target_amount: 0,
      actual_refunded: 0,
      progress_percentage: 0,
      remaining_amount: 0
    };
  },

  // Create budget target
  async createBudgetTarget(target: BudgetTargetInsert): Promise<BudgetTarget> {
    const { data, error } = await supabase
      .from('budget_targets')
      .insert(target)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update budget target
  async updateBudgetTarget(id: string, updates: BudgetTargetUpdate): Promise<BudgetTarget> {
    const { data, error } = await supabase
      .from('budget_targets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete budget target
  async deleteBudgetTarget(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_targets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get available years with claims data
  async getAvailableYears(): Promise<number[]> {
    const { data, error } = await supabase
      .from('claims')
      .select('created_date')
      .order('created_date', { ascending: false });
    
    if (error) throw error;
    
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    
    // Add current and next year
    years.add(currentYear);
    years.add(currentYear + 1);
    
    // Add years from claims data
    data?.forEach(claim => {
      if (claim.created_date) {
        const year = new Date(claim.created_date).getFullYear();
        years.add(year);
      }
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }
};