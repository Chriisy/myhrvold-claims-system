import { useQuery } from '@tanstack/react-query';
import { claimService } from '@/services/claimService';
import { useAuth } from '@/hooks/useOptimizedAuth';

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
        
        // Refund rate calculation
        refundRate: calculateRefundRate(claims),
        
        // Weekly trends
        weeklyTrend: calculateWeeklyTrend(claims),
      };

      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
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
    staleTime: 3 * 60 * 1000, // 3 minutes
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

const calculateRefundRate = (claims: any[]): number => {
  const totalExpected = claims.reduce((sum, c) => sum + (c.expected_refund || 0), 0);
  const totalReceived = claims.reduce((sum, c) => sum + (c.actual_refund || 0), 0);
  
  if (totalExpected === 0) return 0;
  return (totalReceived / totalExpected) * 100;
};

const calculateWeeklyTrend = (claims: any[]) => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  
  const thisWeek = claims.filter(c => new Date(c.created_date) >= oneWeekAgo).length;
  const lastWeek = claims.filter(c => {
    const date = new Date(c.created_date);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  }).length;
  
  if (lastWeek === 0) return thisWeek > 0 ? 100 : 0;
  return ((thisWeek - lastWeek) / lastWeek) * 100;
};

// Cost analytics queries
export const useCostAnalytics = (timeRange: string = '6m') => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['cost-analytics', profile?.department, profile?.role, timeRange],
    queryFn: async () => {
      // Calculate date range
      const now = new Date();
      const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

      // Build query based on user role
      const filters: any = {};
      
      if (profile?.role === 'technician') {
        filters.department = profile.department;
      }

      const claims = await claimService.getClaims({
        ...filters,
        created_date_gte: startDate.toISOString()
      });

      // Calculate total costs with null safety
      const totalCosts = {
        totalClaimCost: claims.reduce((sum, c) => sum + (Number(c.total_cost) || 0), 0),
        totalRefunded: claims.reduce((sum, c) => sum + (Number(c.total_refunded) || 0), 0),
        expectedRefunds: claims.reduce((sum, c) => sum + (Number(c.expected_refund) || 0), 0),
        actualRefunds: claims.reduce((sum, c) => sum + (Number(c.actual_refund) || 0), 0),
        netCost: claims.reduce((sum, c) => sum + (Number(c.net_cost) || (Number(c.total_cost) || 0) - (Number(c.total_refunded) || 0)), 0)
      };

      // Cost by supplier
      const supplierCosts = calculateSupplierCosts(claims);
      
      // Cost by product
      const productCosts = calculateProductCosts(claims);
      
      // Refund analysis
      const refundAnalysis = calculateRefundAnalysis(claims);

      // Monthly cost trends
      const costTrends = calculateCostTrends(claims);

      return {
        totalCosts,
        supplierCosts,
        productCosts,
        refundAnalysis,
        costTrends
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!profile,
  });
};

const calculateSupplierCosts = (claims: any[]) => {
  const supplierMap = new Map();
  
  claims.forEach(claim => {
    const supplierName = claim.supplier || 'Ukjent leverandør';
    
    if (!supplierMap.has(supplierName)) {
      supplierMap.set(supplierName, {
        supplier: supplierName,
        totalCost: 0,
        totalRefunded: 0,
        claimCount: 0,
        avgCost: 0
      });
    }
    
    const supplier = supplierMap.get(supplierName);
    supplier.totalCost += Number(claim.total_cost) || 0;
    supplier.totalRefunded += Number(claim.total_refunded) || 0;
    supplier.claimCount += 1;
  });

  return Array.from(supplierMap.values())
    .map(s => ({
      ...s,
      avgCost: s.claimCount > 0 ? s.totalCost / s.claimCount : 0,
      netCost: s.totalCost - s.totalRefunded
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .filter(s => s.claimCount > 0); // Filter out empty suppliers
};

const calculateProductCosts = (claims: any[]) => {
  const productMap = new Map();
  
  claims.forEach(claim => {
    const productName = claim.product_name || 'Ukjent produkt';
    const productModel = claim.product_model || 'Ingen modell';
    const key = `${productName}-${productModel}`;
    
    if (!productMap.has(key)) {
      productMap.set(key, {
        productName,
        productModel,
        totalCost: 0,
        totalRefunded: 0,
        claimCount: 0
      });
    }
    
    const product = productMap.get(key);
    product.totalCost += Number(claim.total_cost) || 0;
    product.totalRefunded += Number(claim.total_refunded) || 0;
    product.claimCount += 1;
  });

  return Array.from(productMap.values())
    .map(p => ({
      ...p,
      avgCost: p.claimCount > 0 ? p.totalCost / p.claimCount : 0,
      netCost: p.totalCost - p.totalRefunded
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .filter(p => p.claimCount > 0); // Filter out empty products
};

const calculateRefundAnalysis = (claims: any[]) => {
  const refundStats = {
    totalExpected: claims.reduce((sum, c) => sum + (c.expected_refund || 0), 0),
    totalReceived: claims.reduce((sum, c) => sum + (c.actual_refund || 0), 0),
    pendingRefunds: claims.filter(c => c.refund_status === 'pending').length,
    completedRefunds: claims.filter(c => c.refund_status === 'received').length,
    refundRate: 0
  };

  if (refundStats.totalExpected > 0) {
    refundStats.refundRate = (refundStats.totalReceived / refundStats.totalExpected) * 100;
  }

  // Refunds by supplier with null safety
  const supplierRefunds = new Map();
  claims.forEach(claim => {
    const supplierName = claim.supplier || 'Ukjent leverandør';
    
    if (!supplierRefunds.has(supplierName)) {
      supplierRefunds.set(supplierName, {
        supplier: supplierName,
        expectedRefunds: 0,
        actualRefunds: 0,
        refundRate: 0
      });
    }
    
    const supplier = supplierRefunds.get(supplierName);
    supplier.expectedRefunds += claim.expected_refund || 0;
    supplier.actualRefunds += claim.actual_refund || 0;
  });

  const refundsBySupplier = Array.from(supplierRefunds.values())
    .map(s => ({
      ...s,
      refundRate: s.expectedRefunds > 0 ? (s.actualRefunds / s.expectedRefunds) * 100 : 0
    }))
    .sort((a, b) => b.expectedRefunds - a.expectedRefunds);

  return {
    ...refundStats,
    refundsBySupplier
  };
};

const calculateCostTrends = (claims: any[]) => {
  const monthMap = new Map();
  
  claims.forEach(claim => {
    const date = new Date(claim.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        totalCosts: 0,
        totalRefunds: 0,
        netCosts: 0,
        claimCount: 0
      });
    }
    
    const month = monthMap.get(monthKey);
    month.totalCosts += Number(claim.total_cost) || 0;
    month.totalRefunds += Number(claim.total_refunded) || 0;
    month.netCosts += Number(claim.net_cost) || (Number(claim.total_cost) || 0) - (Number(claim.total_refunded) || 0);
    month.claimCount += 1;
  });

  return Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month));
};