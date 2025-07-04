import { useQuery } from '@tanstack/react-query';
import { claimService, ClaimWithRelations, ClaimRow } from '@/services/claimService';

export const useClaim = (claimId: string | undefined) => {
  return useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => {
      if (!claimId) {
        throw new Error('No claim ID provided');
      }
      return claimService.getClaim(claimId);
    },
    enabled: !!claimId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useClaims = (filters?: {
  status?: ClaimRow['status'];
  department?: ClaimRow['department'];
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['claims', filters],
    queryFn: () => claimService.getClaims(filters),
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};