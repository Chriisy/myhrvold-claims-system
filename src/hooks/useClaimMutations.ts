import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimService } from '@/services/claimService';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { Tables } from '@/integrations/supabase/types';

export const useUpdateClaimStatus = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useEnhancedToast();

  return useMutation({
    mutationFn: ({ 
      claimId, 
      status, 
      notes 
    }: { 
      claimId: string; 
      status: Tables<'claims'>['status']; 
      notes?: string; 
    }) => claimService.updateClaimStatus(claimId, status, notes),
    
    onSuccess: (_, variables) => {
      // Invalidate and refetch claim data
      queryClient.invalidateQueries({ queryKey: ['claim', variables.claimId] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      
      showSuccess(
        "Status oppdatert",
        "Reklamasjonsstatus ble oppdatert"
      );
    },
    
    onError: (error) => {
      console.error('Error updating claim status:', error);
      showError(
        "Feil ved oppdatering",
        error instanceof Error ? error.message : "Kunne ikke oppdatere status"
      );
    }
  });
};