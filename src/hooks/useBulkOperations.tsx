import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useOptimizedAuth';

export type BulkOperationType = 'status' | 'delete' | 'assign' | 'priority';

export interface BulkOperation {
  type: BulkOperationType;
  data: any;
}

export const useBulkOperations = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((id: string) => {
    return selectedItems.includes(id);
  }, [selectedItems]);

  const isAllSelected = useCallback((ids: string[]) => {
    return ids.length > 0 && ids.every(id => selectedItems.includes(id));
  }, [selectedItems]);

  const isSomeSelected = useCallback((ids: string[]) => {
    return ids.some(id => selectedItems.includes(id));
  }, [selectedItems]);

  const executeStatusChange = async (newStatus: 'new' | 'pending_approval' | 'under_processing' | 'sent_supplier' | 'awaiting_response' | 'resolved' | 'rejected') => {
    if (selectedItems.length === 0 || !user) return;

    setIsLoading(true);
    try {
      // Update claims status
      const { error } = await supabase
        .from('claims')
        .update({ status: newStatus })
        .in('id', selectedItems);

      if (error) throw error;

      // Create timeline entries
      const timelineEntries = selectedItems.map(claimId => ({
        claim_id: claimId,
        status: newStatus,
        changed_by: user.id,
        notes: `Status endret til ${newStatus} (bulk operasjon)`,
      }));

      await supabase
        .from('claim_timeline')
        .insert(timelineEntries);

      toast({
        title: "Status oppdatert",
        description: `${selectedItems.length} reklamasjoner oppdatert til ${newStatus}`,
      });

      clearSelection();
      return true;
    } catch (error: any) {
      toast({
        title: "Feil ved statusendring",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('claims')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      toast({
        title: "Reklamasjoner slettet",
        description: `${selectedItems.length} reklamasjoner ble slettet`,
      });

      clearSelection();
      return true;
    } catch (error: any) {
      toast({
        title: "Feil ved sletting",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeBulkAssign = async (technicianId: string, technicianName: string) => {
    if (selectedItems.length === 0 || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('claims')
        .update({ 
          assigned_to: technicianId,
          technician_name: technicianName 
        })
        .in('id', selectedItems);

      if (error) throw error;

      // Create timeline entries
      const timelineEntries = selectedItems.map(claimId => ({
        claim_id: claimId,
        status: 'under_processing' as const,
        changed_by: user.id,
        notes: `Tildelt til ${technicianName} (bulk operasjon)`,
      }));

      await supabase
        .from('claim_timeline')
        .insert(timelineEntries);

      toast({
        title: "Reklamasjoner tildelt",
        description: `${selectedItems.length} reklamasjoner tildelt til ${technicianName}`,
      });

      clearSelection();
      return true;
    } catch (error: any) {
      toast({
        title: "Feil ved tildeling",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedItems,
    isLoading,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
    executeStatusChange,
    executeBulkDelete,
    executeBulkAssign,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length,
  };
};