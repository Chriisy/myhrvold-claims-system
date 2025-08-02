import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('name, enabled');

      if (error) {
        console.error('Error fetching feature flags:', error);
        return;
      }

      const flagMap = (data || []).reduce((acc, flag) => {
        acc[flag.name] = flag.enabled;
        return acc;
      }, {} as Record<string, boolean>);

      setFlags(flagMap);
    } catch (error) {
      console.error('Error in fetchFlags:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = (flagName: string): boolean => {
    return flags[flagName] || false;
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    loading,
    isEnabled,
    refetch: fetchFlags
  };
};