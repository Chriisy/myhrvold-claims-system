import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { claimService } from '@/services/claimService';
import { useAuth } from '@/hooks/useOptimizedAuth';
import { useRequestDeduplication } from '@/hooks/useRequestDeduplication';
// Fallback type definition if Supabase types are not available
interface ClaimRow {
  id: string;
  status: 'new' | 'pending_approval' | 'under_processing' | 'sent_supplier' | 'resolved' | 'rejected';
  department: 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet';
  urgency_level: 'low' | 'normal' | 'high' | 'critical';
  claim_number: string;
  customer_name: string;
  product_name: string;
  supplier: string;
  created_date: string;
  [key: string]: any;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface ClaimsFilters {
  status?: ClaimRow['status'];
  department?: ClaimRow['department'];
  urgency?: ClaimRow['urgency_level'];
  supplier?: string;
  search?: string;
}

export const useClaimsPaginated = (filters: ClaimsFilters = {}) => {
  const { profile } = useAuth();
  const { deduplicateRequest } = useRequestDeduplication();
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  });

  // Create a stable query key for caching
  const queryKey = useMemo(() => [
    'claims-paginated',
    pagination.page,
    pagination.pageSize,
    filters,
    profile?.department,
    profile?.role,
  ], [pagination.page, pagination.pageSize, filters, profile?.department, profile?.role]);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const cacheKey = `claims-${JSON.stringify(queryKey)}`;
      
      return deduplicateRequest(cacheKey, async () => {
        // Build filters based on user role and provided filters
        const queryFilters: any = {
          limit: pagination.pageSize,
          offset: (pagination.page - 1) * pagination.pageSize,
        };

        // Role-based filtering
        if (profile?.role === 'technician') {
          queryFilters.department = profile.department;
        }

        // Apply user filters
        if (filters.status) {
          queryFilters.status = filters.status;
        }
        if (filters.department && profile?.role === 'admin') {
          queryFilters.department = filters.department;
        }
        if (filters.urgency) {
          queryFilters.urgency = filters.urgency;
        }
        if (filters.supplier) {
          queryFilters.supplier = filters.supplier;
        }
        if (filters.search) {
          queryFilters.search = filters.search;
        }

        const claims = await claimService.getClaims(queryFilters);
        
        // Calculate total count for pagination
        // In a real app, you'd want a separate count query for better performance
        const totalClaims = await claimService.getClaims({
          status: filters.status,
          department: profile?.role === 'technician' ? profile.department : filters.department,
          urgency: filters.urgency,
          supplier: filters.supplier,
          search: filters.search,
        });

        return {
          claims,
          total: totalClaims.length,
        };
      });
    },
    enabled: !!profile,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update total when data changes
  const { data, ...rest } = query;
  
  useMemo(() => {
    if (data?.total !== undefined && data.total !== pagination.total) {
      setPagination(prev => ({ ...prev, total: data.total }));
    }
  }, [data?.total, pagination.total]);

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const changePageSize = (pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    ...rest,
    data: data?.claims || [],
    pagination: {
      ...pagination,
      totalPages,
    },
    goToPage,
    changePageSize,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
};