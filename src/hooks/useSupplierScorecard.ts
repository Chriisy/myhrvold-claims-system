import { useQuery } from '@tanstack/react-query';
import { supplierScorecardService, type SupplierScorecard } from '@/services/supplierScorecardService';
import { useAuth } from '@/hooks/useOptimizedAuth';

export const useSupplierScorecards = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['supplier-scorecards'],
    queryFn: supplierScorecardService.getSupplierScorecards,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSupplierScorecard = (supplierName: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['supplier-scorecard', supplierName],
    queryFn: () => supplierScorecardService.getSupplierScorecard(supplierName),
    enabled: !!user && !!supplierName,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTopSuppliers = (limit = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['top-suppliers', limit],
    queryFn: () => supplierScorecardService.getTopSuppliers(limit),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};