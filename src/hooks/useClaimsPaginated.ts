import { useInfiniteQuery } from '@tanstack/react-query';
import { claimService } from '@/services/claimService';
import { useAuth } from '@/hooks/useAuth';

const CLAIMS_PER_PAGE = 20;

interface ClaimsPageData {
  claims: any[];
  nextPage?: number;
  hasMore: boolean;
}

export const useClaimsPaginated = (filters?: {
  status?: string;
  searchTerm?: string;
}) => {
  const { profile } = useAuth();

  return useInfiniteQuery<ClaimsPageData>({
    queryKey: ['claims-paginated', filters, profile?.department],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const currentPage = typeof pageParam === 'number' ? pageParam : 0;
      const offset = currentPage * CLAIMS_PER_PAGE;
      
      // Apply role-based filtering
      const queryFilters: any = {
        limit: CLAIMS_PER_PAGE,
        offset: offset,
      };

      if (profile?.role === 'technician') {
        queryFilters.department = profile.department;
      }

      if (filters?.status && filters.status !== 'all') {
        queryFilters.status = filters.status;
      }

      const claims = await claimService.getClaims(queryFilters);
      
      // Apply search filter on client side for better UX
      let filteredClaims = claims;
      if (filters?.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredClaims = claims.filter(claim => 
          claim.claim_number?.toLowerCase().includes(searchLower) ||
          claim.customer_name?.toLowerCase().includes(searchLower) ||
          claim.product_name?.toLowerCase().includes(searchLower)
        );
      }

      return {
        claims: filteredClaims,
        nextPage: claims.length === CLAIMS_PER_PAGE ? currentPage + 1 : undefined,
        hasMore: claims.length === CLAIMS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage: ClaimsPageData) => lastPage.nextPage,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};