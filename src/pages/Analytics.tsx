import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, AlertTriangle, DollarSign, Package, Building2, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ProductError {
  product_name: string;
  product_model: string;
  error_count: number;
  total_cost: number;
  avg_cost: number;
}

interface SupplierStats {
  supplier: string;
  claim_count: number;
  total_cost: number;
  avg_cost: number;
  resolution_rate: number;
}

interface TrendData {
  month: string;
  claims: number;
  costs: number;
  refunds: number;
}

const Analytics = () => {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState("6m");
  const [loading, setLoading] = useState(true);
  
  // Analytics data
  const [productErrors, setProductErrors] = useState<ProductError[]>([]);
  const [supplierStats, setSupplierStats] = useState<SupplierStats[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [partsAnalytics, setPartsAnalytics] = useState<any[]>([]);
  const [partsSupplierStats, setPartsSupplierStats] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      fetchAnalyticsData();
    }
  }, [profile, timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      const months = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
      const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

      // Base query
      let baseQuery = supabase
        .from('claims')
        .select('*')
        .gte('created_date', startDate.toISOString());

      // Filter for technicians
      if (profile?.role === 'technician') {
        baseQuery = baseQuery.eq('department', profile.department);
      }

      const { data: claims, error } = await baseQuery;
      if (error) throw error;

      // Process product errors
      await processProductErrors(claims || []);
      
      // Process supplier statistics
      await processSupplierStats(claims || []);
      
      // Process trends
      await processTrends(claims || []);
      
      // Process department stats (admin only)
      if (profile?.role === 'admin') {
        await processDepartmentStats(claims || []);
      }

      // Process parts analytics
      await processPartsAnalytics(claims || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processProductErrors = async (claims: any[]) => {
    const productMap = new Map();
    
    claims.forEach(claim => {
      const key = `${claim.product_name}-${claim.product_model || 'N/A'}`;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_name: claim.product_name,
          product_model: claim.product_model || 'N/A',
          error_count: 0,
          total_cost: 0,
        });
      }
      
      const product = productMap.get(key);
      product.error_count += 1;
      product.total_cost += claim.total_cost || 0;
    });

    const products = Array.from(productMap.values())
      .map(p => ({
        ...p,
        avg_cost: p.total_cost / p.error_count,
      }))
      .sort((a, b) => b.error_count - a.error_count)
      .slice(0, 10);

    setProductErrors(products);
  };

  const processSupplierStats = async (claims: any[]) => {
    const supplierMap = new Map();
    
    claims.forEach(claim => {
      if (!supplierMap.has(claim.supplier)) {
        supplierMap.set(claim.supplier, {
          supplier: claim.supplier,
          claim_count: 0,
          total_cost: 0,
          resolved_count: 0,
        });
      }
      
      const supplier = supplierMap.get(claim.supplier);
      supplier.claim_count += 1;
      supplier.total_cost += claim.total_cost || 0;
      if (claim.status === 'resolved') {
        supplier.resolved_count += 1;
      }
    });

    const suppliers = Array.from(supplierMap.values())
      .map(s => ({
        ...s,
        avg_cost: s.total_cost / s.claim_count,
        resolution_rate: (s.resolved_count / s.claim_count) * 100,
      }))
      .sort((a, b) => b.claim_count - a.claim_count);

    setSupplierStats(suppliers);
  };

  const processTrends = async (claims: any[]) => {
    const monthMap = new Map();
    
    claims.forEach(claim => {
      const date = new Date(claim.created_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          claims: 0,
          costs: 0,
          refunds: 0,
        });
      }
      
      const month = monthMap.get(monthKey);
      month.claims += 1;
      month.costs += claim.total_cost || 0;
      month.refunds += claim.expected_refund || 0;
    });

    const trendData = Array.from(monthMap.values())
      .sort((a, b) => a.month.localeCompare(b.month));

    setTrends(trendData);
  };

  const processDepartmentStats = async (claims: any[]) => {
    const deptMap = new Map();
    
    claims.forEach(claim => {
      if (!deptMap.has(claim.department)) {
        deptMap.set(claim.department, {
          department: claim.department,
          claim_count: 0,
          total_cost: 0,
        });
      }
      
      const dept = deptMap.get(claim.department);
      dept.claim_count += 1;
      dept.total_cost += claim.total_cost || 0;
    });

    const departments = Array.from(deptMap.values());
    setDepartmentStats(departments);
  };

  const processPartsAnalytics = async (claims: any[]) => {
    const partsMap = new Map();
    const supplierPartsMap = new Map();
    
    claims.forEach(claim => {
      // Parse custom line items to get parts data
      let customLineItems = [];
      try {
        if (claim.custom_line_items) {
          customLineItems = typeof claim.custom_line_items === 'string' 
            ? JSON.parse(claim.custom_line_items) 
            : claim.custom_line_items;
        }
      } catch (error) {
        console.error('Error parsing custom_line_items:', error);
      }

      customLineItems.forEach((item: any) => {
        const partNumber = item.partNumber || item.part_number || 'Ukjent';
        const description = item.description || '';
        const quantity = parseInt(item.quantity) || 1;
        const unitPrice = parseFloat(item.unitPrice || item.unit_price) || 0;
        const totalCost = quantity * unitPrice;

        // Parts statistics
        if (!partsMap.has(partNumber)) {
          partsMap.set(partNumber, {
            partNumber,
            description,
            totalQuantity: 0,
            totalCost: 0,
            usageCount: 0,
            avgPrice: 0,
            claimIds: new Set()
          });
        }

        const part = partsMap.get(partNumber);
        part.totalQuantity += quantity;
        part.totalCost += totalCost;
        part.usageCount += 1;
        part.claimIds.add(claim.id);
        part.avgPrice = part.totalCost / part.totalQuantity;

        // Supplier parts statistics
        const supplier = claim.supplier || 'Ukjent leverandør';
        if (!supplierPartsMap.has(supplier)) {
          supplierPartsMap.set(supplier, {
            supplier,
            totalPartsCost: 0,
            uniqueParts: new Set(),
            partsCount: 0
          });
        }

        const supplierParts = supplierPartsMap.get(supplier);
        supplierParts.totalPartsCost += totalCost;
        supplierParts.uniqueParts.add(partNumber);
        supplierParts.partsCount += quantity;
      });
    });

    // Convert to arrays and sort
    const parts = Array.from(partsMap.values())
      .map(p => ({
        ...p,
        claimCount: p.claimIds.size,
        claimIds: undefined
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    const supplierParts = Array.from(supplierPartsMap.values())
      .map(s => ({
        ...s,
        uniquePartsCount: s.uniqueParts.size,
        uniqueParts: undefined
      }))
      .sort((a, b) => b.totalPartsCost - a.totalPartsCost);

    setPartsAnalytics(parts);
    setPartsSupplierStats(supplierParts);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const TrendsLoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Tilbake til dashboard</span>
                  <span className="sm:hidden">Tilbake</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Analytics & Rapporter</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Detaljert analyse av reklamasjoner og kostnader</p>
              </div>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Velg tidsperiode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Siste 3 måneder</SelectItem>
                <SelectItem value="6m">Siste 6 måneder</SelectItem>
                <SelectItem value="12m">Siste 12 måneder</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className={`grid w-full ${profile?.role === 'admin' ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-4'}`}>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Produktfeil</span>
              <span className="sm:hidden">Produkter</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Leverandører</span>
              <span className="sm:hidden">Leverandør</span>
            </TabsTrigger>
            <TabsTrigger value="parts" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Deler</span>
              <span className="sm:hidden">Deler</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-xs sm:text-sm">Trender</TabsTrigger>
            {profile?.role === 'admin' && (
              <TabsTrigger value="departments" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Avdelinger</span>
                <span className="sm:hidden">Avdeling</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Product Errors Tab */}
          <TabsContent value="products" className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Top 10 produkter med flest feil
                    </CardTitle>
                    <CardDescription>Rangert etter antall reklamasjoner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      error_count: { label: "Antall feil", color: "hsl(var(--primary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productErrors}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="product_name" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="error_count" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Kostnader per produkt
                    </CardTitle>
                    <CardDescription>Gjennomsnittlig kostnad per reklamasjon</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {productErrors.slice(0, 5).map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.product_name}</p>
                            <p className="text-sm text-muted-foreground">{product.product_model}</p>
                            <p className="text-sm text-muted-foreground">{product.error_count} feil</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(product.avg_cost)}</p>
                            <p className="text-sm text-muted-foreground">gj.snitt</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Leverandører med flest claims
                    </CardTitle>
                    <CardDescription>Rangert etter antall reklamasjoner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      claim_count: { label: "Antall claims", color: "hsl(var(--secondary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={supplierStats.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="supplier" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="claim_count" fill="hsl(var(--secondary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leverandør statistikk</CardTitle>
                    <CardDescription>Detaljert oversikt over leverandørprestasjoner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {supplierStats.slice(0, 5).map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{supplier.supplier}</p>
                            <p className="text-sm text-muted-foreground">{supplier.claim_count} claims</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.resolution_rate.toFixed(1)}% løst
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(supplier.total_cost)}</p>
                            <p className="text-sm text-muted-foreground">total kostnad</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Parts Analytics Tab */}
          <TabsContent value="parts" className="space-y-6">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Mest brukte deler
                    </CardTitle>
                    <CardDescription>Rangert etter total kostnad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      totalCost: { label: "Total kostnad", color: "hsl(var(--primary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={partsAnalytics.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="partNumber" 
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="totalCost" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Mest brukte deler
                    </CardTitle>
                    <CardDescription>Deler som brukes oftest i reklamasjoner</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      usageCount: { label: "Antall ganger brukt", color: "hsl(var(--primary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={partsAnalytics.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="partNumber" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="usageCount" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Delestatistikk
                    </CardTitle>
                    <CardDescription>Detaljert oversikt over delekostnader</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {partsAnalytics.slice(0, 8).map((part, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{part.partNumber}</p>
                            <p className="text-sm text-muted-foreground">{part.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Brukt {part.usageCount} ganger i {part.claimCount} claims
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(part.totalCost)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(part.avgPrice)}/stk
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Deler per leverandør
                    </CardTitle>
                    <CardDescription>Delekostnader fordelt på leverandører</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      totalPartsCost: { label: "Delekostnader", color: "hsl(var(--secondary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={partsSupplierStats.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ supplier, percent }) => `${supplier} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="totalPartsCost"
                          >
                            {partsSupplierStats.slice(0, 6).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leverandør deleoversikt</CardTitle>
                    <CardDescription>Antall ulike deler og totalkostnad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {partsSupplierStats.slice(0, 5).map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{supplier.supplier}</p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.uniquePartsCount} ulike deler
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {supplier.partsCount} deler totalt
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(supplier.totalPartsCost)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(supplier.totalPartsCost / supplier.partsCount)}/stk
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {loading ? (
              <TrendsLoadingSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Trend analyse
                    </CardTitle>
                    <CardDescription>Utvikling av reklamasjoner og kostnader over tid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      claims: { label: "Antall claims", color: "hsl(var(--primary))" },
                      costs: { label: "Kostnader (NOK)", color: "hsl(var(--secondary))" }
                    }}>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="claims" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                          />
                          <Line 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="costs" 
                            stroke="hsl(var(--secondary))" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Departments Tab (Admin only) */}
          {profile?.role === 'admin' && (
            <TabsContent value="departments" className="space-y-6">
              {loading ? (
                <LoadingSkeleton />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Claims per avdeling</CardTitle>
                      <CardDescription>Fordeling av reklamasjoner per avdeling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={{
                        value: { label: "Antall claims", color: "hsl(var(--primary))" }
                      }}>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={departmentStats.map(d => ({ name: d.department, value: d.claim_count }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="hsl(var(--primary))"
                              dataKey="value"
                            >
                              {departmentStats.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Kostnader per avdeling</CardTitle>
                      <CardDescription>Total kostnad per avdeling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {departmentStats
                          .sort((a, b) => b.total_cost - a.total_cost)
                          .map((dept, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium capitalize">{dept.department}</p>
                              <p className="text-sm text-muted-foreground">{dept.claim_count} claims</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(dept.total_cost)}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(dept.total_cost / dept.claim_count)} gj.snitt
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;