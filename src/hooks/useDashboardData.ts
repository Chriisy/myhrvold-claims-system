import { useQuery } from '@tanstack/react-query';
import { claimService } from '@/services/claimService';
import { useAuth } from '@/hooks/useAuth';

// Dashboard statistics query
export const useDashboardStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', profile?.department, profile?.role],
    queryFn: async () => {
      // Build query based on user role
      const filters: any = {};
      
      if (profile?.role === 'technician') {
        filters.department = profile.department;
      }

      const claims = await claimService.getClaims(filters);
      
      // Calculate statistics
      const stats = {
        totalClaims: claims.length,
        pendingApproval: claims.filter(c => c.status === 'pending_approval').length,
        underProcessing: claims.filter(c => c.status === 'under_processing').length,
        sentToSupplier: claims.filter(c => c.status === 'sent_supplier').length,
        resolved: claims.filter(c => c.status === 'resolved').length,
        rejected: claims.filter(c => c.status === 'rejected').length,
        
        // Cost calculations
        totalCosts: claims.reduce((sum, c) => sum + (c.total_cost || 0), 0),
        expectedRefunds: claims.reduce((sum, c) => sum + (c.expected_refund || 0), 0),
        actualRefunds: claims.reduce((sum, c) => sum + (c.actual_refund || 0), 0),
        
        // Department breakdown (for admins)
        departmentStats: profile?.role === 'admin' ? calculateDepartmentStats(claims) : null,
        
        // Recent activity
        recentClaims: claims
          .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
          .slice(0, 5),
          
        // Urgency breakdown
        urgencyStats: {
          critical: claims.filter(c => c.urgency_level === 'critical').length,
          high: claims.filter(c => c.urgency_level === 'high').length,
          normal: claims.filter(c => c.urgency_level === 'normal').length,
          low: claims.filter(c => c.urgency_level === 'low').length,
        },
        
        // Performance metrics
        averageResolutionTime: calculateAverageResolutionTime(claims),
        overdueClaimsCount: calculateOverdueClaims(claims).length,
      };

      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    enabled: !!profile,
  });
};

// Recent claims with real-time updates
export const useRecentClaims = (limit: number = 10) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['recent-claims', profile?.department, profile?.role, limit],
    queryFn: async () => {
      const filters: any = { limit };
      
      if (profile?.role === 'technician') {
        filters.department = profile.department;
      }

      return await claimService.getClaims(filters);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!profile,
  });
};

// Helper functions
const calculateDepartmentStats = (claims: any[]) => {
  const departments = ['oslo', 'bergen', 'trondheim', 'stavanger', 'kristiansand', 'nord_norge', 'innlandet'];
  
  return departments.map(dept => ({
    department: dept,
    total: claims.filter(c => c.department === dept).length,
    pending: claims.filter(c => c.department === dept && c.status === 'pending_approval').length,
    resolved: claims.filter(c => c.department === dept && c.status === 'resolved').length,
    avgCost: calculateAvgCost(claims.filter(c => c.department === dept)),
  }));
};

const calculateAverageResolutionTime = (claims: any[]): number => {
  const resolvedClaims = claims.filter(c => c.status === 'resolved' && c.created_date);
  
  if (resolvedClaims.length === 0) return 0;
  
  const totalDays = resolvedClaims.reduce((sum, claim) => {
    const createdDate = new Date(claim.created_date);
    const resolvedDate = new Date(claim.updated_date); // Assuming resolved date is last update
    const diffTime = Math.abs(resolvedDate.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return sum + diffDays;
  }, 0);
  
  return Math.round(totalDays / resolvedClaims.length);
};

const calculateOverdueClaims = (claims: any[]) => {
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  return claims.filter(claim => {
    const createdDate = new Date(claim.created_date);
    return (
      ['pending_approval', 'under_processing', 'sent_supplier'].includes(claim.status) &&
      createdDate < sevenDaysAgo
    );
  });
};

const calculateAvgCost = (claims: any[]): number => {
  if (claims.length === 0) return 0;
  const totalCost = claims.reduce((sum, c) => sum + (c.total_cost || 0), 0);
  return Math.round(totalCost / claims.length);
};