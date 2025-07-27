import { supabase } from '@/integrations/supabase/client';
import { Tables, Database } from '@/integrations/supabase/types';

export type ClaimRow = Tables<'claims'>;

export interface ClaimWithRelations extends ClaimRow {
  timeline?: Array<{
    id: string;
    changed_date: string;
    changed_by: string;
    status: ClaimRow['status'];
    notes?: string;
  }>;
}

export const claimService = {
  async getClaim(claimId: string): Promise<ClaimWithRelations | null> {
    const { data: claim, error } = await supabase
      .from('claims')
      .select('*')
      .eq('id', claimId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching claim:', error);
      throw new Error(`Failed to fetch claim: ${error.message}`);
    }

    if (!claim) {
      return null;
    }

    // Fetch timeline separately
    const { data: timeline, error: timelineError } = await supabase
      .from('claim_timeline')
      .select('*')
      .eq('claim_id', claimId)
      .order('changed_date', { ascending: false });

    if (timelineError) {
      console.error('Error fetching claim timeline:', timelineError);
      // Don't throw here, just return claim without timeline
    }

    return {
      ...claim,
      timeline: timeline || []
    };
  },

  async getClaims(filters?: {
    status?: ClaimRow['status'];
    department?: ClaimRow['department'];
    urgency?: ClaimRow['urgency_level'];
    supplier?: string;
    limit?: number;
    offset?: number;
    search?: string;
    created_date_gte?: string;
  }): Promise<ClaimRow[]> {
    let query = supabase
      .from('claims')
      .select('*')
      .order('created_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.department) {
      query = query.eq('department', filters.department);
    }

    if (filters?.urgency) {
      query = query.eq('urgency_level', filters.urgency);
    }

    if (filters?.supplier) {
      query = query.ilike('supplier', `%${filters.supplier}%`);
    }

    if (filters?.search) {
      query = query.or(`customer_name.ilike.%${filters.search}%,product_name.ilike.%${filters.search}%,claim_number.ilike.%${filters.search}%`);
    }

    if (filters?.created_date_gte) {
      query = query.gte('created_date', filters.created_date_gte);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching claims:', error);
      throw new Error(`Failed to fetch claims: ${error.message}`);
    }

    return data || [];
  },

  async updateClaimStatus(claimId: string, status: ClaimRow['status'], notes?: string): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .update({ 
        status, 
        updated_date: new Date().toISOString() 
      })
      .eq('id', claimId);

    if (error) {
      console.error('Error updating claim status:', error);
      throw new Error(`Failed to update claim status: ${error.message}`);
    }

    // Add timeline entry
    if (notes) {
      const { error: timelineError } = await supabase
        .from('claim_timeline')
        .insert({
          claim_id: claimId,
          status,
          notes,
          changed_by: (await supabase.auth.getUser()).data.user?.id || '',
        });

      if (timelineError) {
        console.error('Error adding timeline entry:', timelineError);
        // Don't throw here, status update succeeded
      }
    }
  },

  async deleteClaim(claimId: string): Promise<void> {
    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', claimId);

    if (error) {
      console.error('Error deleting claim:', error);
      throw new Error(`Failed to delete claim: ${error.message}`);
    }
  }
};