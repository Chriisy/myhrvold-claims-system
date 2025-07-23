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

export const useDeleteClaim = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useEnhancedToast();

  return useMutation({
    mutationFn: (claimId: string) => claimService.deleteClaim(claimId),
    
    onSuccess: (_, claimId) => {
      // Invalidate all claims-related queries
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claims-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-claims'] });
      queryClient.invalidateQueries({ queryKey: ['cost-analytics'] });
      queryClient.removeQueries({ queryKey: ['claim', claimId] });
      
      showSuccess(
        "Reklamasjon slettet",
        "Reklamasjonen ble permanent slettet"
      );
    },
    
    onError: (error) => {
      console.error('Error deleting claim:', error);
      showError(
        "Feil ved sletting",
        error instanceof Error ? error.message : "Kunne ikke slette reklamasjon"
      );
    }
  });
};