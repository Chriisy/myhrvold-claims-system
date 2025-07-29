import { supabase } from "@/integrations/supabase/client";

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'cookies' | 'data_processing' | 'marketing';
  consent_given: boolean;
  consent_date: string;
  withdrawn_date?: string;
}

export interface UserDataExport {
  profile: any;
  claims: any[];
  consent: ConsentRecord[];
  exported_at: string;
}

export const gdprService = {
  // Record user consent
  async recordConsent(consentType: string, consentGiven: boolean) {
    const { data, error } = await supabase
      .from('user_consent')
      .upsert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        consent_type: consentType,
        consent_given: consentGiven,
        consent_date: new Date().toISOString(),
        withdrawn_date: consentGiven ? null : new Date().toISOString()
      }, {
        onConflict: 'user_id,consent_type'
      });

    if (error) throw error;
    return data;
  },

  // Get user consent status
  async getUserConsent(userId?: string) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('user_consent')
      .select('*')
      .eq('user_id', targetUserId);

    if (error) throw error;
    return data as ConsentRecord[];
  },

  // Export user data (GDPR Article 20)
  async exportUserData(userId?: string): Promise<UserDataExport> {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase.rpc('export_user_data', {
      p_user_id: targetUserId
    });

    if (error) throw error;
    return data as unknown as UserDataExport;
  },

  // Request data deletion (GDPR Article 17)
  async requestDataDeletion(userId?: string) {
    const targetUserId = userId || (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase.rpc('anonymize_user_data', {
      p_user_id: targetUserId
    });

    if (error) throw error;
    return data;
  },

  // Log data access for audit trail
  async logDataAccess(tableName: string, operation: string, recordId?: string) {
    const { data, error } = await supabase.rpc('log_data_access', {
      p_table_name: tableName,
      p_operation: operation,
      p_record_id: recordId
    });

    if (error) throw error;
    return data;
  },

  // Get audit logs (admin only)
  async getAuditLogs(userId?: string, limit = 100) {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};