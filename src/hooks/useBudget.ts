import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService, type BudgetTarget, type BudgetTargetInsert, type BudgetTargetUpdate } from '@/services/budgetService';
import { useAuth } from '@/hooks/useOptimizedAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

export const useBudgetTargets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budget-targets'],
    queryFn: budgetService.getBudgetTargets,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useBudgetTargetsByYear = (year: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budget-targets', year],
    queryFn: () => budgetService.getBudgetTargetsByYear(year),
    enabled: !!user && !!year,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useBudgetProgress = (year: number, department?: Database['public']['Enums']['department'], supplierName?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budget-progress', year, department, supplierName],
    queryFn: () => budgetService.getBudgetProgress(year, department, supplierName),
    enabled: !!user && !!year,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for real-time feel
    refetchOnWindowFocus: false,
  });
};

export const useAvailableYears = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['available-years'],
    queryFn: budgetService.getAvailableYears,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateBudgetTarget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (target: BudgetTargetInsert) => budgetService.createBudgetTarget(target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-targets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] });
      toast({
        title: "Budsjettmål opprettet",
        description: "Det nye budsjettmålet er lagret.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil ved opprettelse",
        description: error.message || "Kunne ikke opprette budsjettmål",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateBudgetTarget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: BudgetTargetUpdate }) =>
      budgetService.updateBudgetTarget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-targets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] });
      toast({
        title: "Budsjettmål oppdatert",
        description: "Endringene er lagret.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil ved oppdatering",
        description: error.message || "Kunne ikke oppdatere budsjettmål",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteBudgetTarget = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => budgetService.deleteBudgetTarget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget-targets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-progress'] });
      toast({
        title: "Budsjettmål slettet",
        description: "Budsjettmålet er fjernet.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Feil ved sletting",
        description: error.message || "Kunne ikke slette budsjettmål",
        variant: "destructive",
      });
    },
  });
};