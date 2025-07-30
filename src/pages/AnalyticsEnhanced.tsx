import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, DollarSign, Package, Building2, FileDown, Loader2, Target, Plus, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useCostAnalytics } from "@/hooks/useDashboardData";
import { useBudgetTargets, useCreateBudgetTarget, useUpdateBudgetTarget, useDeleteBudgetTarget, useBudgetProgress, useAvailableYears } from "@/hooks/useBudget";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import type { BudgetTarget } from "@/services/budgetService";

interface BudgetFormData {
  year: number;
  target_amount: number;
  department?: string;
  supplier_name?: string;
  notes?: string;
}

const AnalyticsEnhanced = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("6m");
  const [exportingPdf, setExportingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Budget state
  const [selectedBudgetYear, setSelectedBudgetYear] = useState(new Date().getFullYear());
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<BudgetTarget | null>(null);
  const [budgetFormData, setBudgetFormData] = useState<BudgetFormData>({
    year: new Date().getFullYear(),
    target_amount: 0,
    department: '',
    supplier_name: '',
    notes: ''
  });
  
  const { data: costData, isLoading: costLoading } = useCostAnalytics(timeRange);

  // Budget hooks
  const { user } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const { data: availableBudgetYears } = useAvailableYears();
  const { data: budgetTargets } = useBudgetTargets();
  const { data: budgetProgress } = useBudgetProgress(selectedBudgetYear);
  const createBudgetMutation = useCreateBudgetTarget();
  const updateBudgetMutation = useUpdateBudgetTarget();
  const deleteBudgetMutation = useDeleteBudgetTarget();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    setExportingPdf(true);
    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // Add title
      pdf.setFontSize(16);
      pdf.text('Analytics & Kostnadsrapport', pdfWidth / 2, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(10);
      pdf.text(`Generert: ${new Date().toLocaleDateString('nb-NO')}`, 20, 15);
      pdf.text(`Periode: ${timeRange === '3m' ? 'Siste 3 måneder' : timeRange === '6m' ? 'Siste 6 måneder' : 'Siste 12 måneder'}`, pdfWidth - 20, 15, { align: 'right' });

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      pdf.save(`analytics-rapport-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF eksportert",
        description: "Analyserapporten har blitt lastet ned som PDF",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Feil ved PDF-eksport",
        description: "Det oppstod en feil ved eksport av PDF",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-primary">Analytics & Kostnadsrapporter</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Detaljert kostnadsanalyse og rapportering</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
              <Button 
                onClick={exportToPDF} 
                disabled={exportingPdf || costLoading}
                className="w-full sm:w-auto"
              >
                {exportingPdf ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4 mr-2" />
                )}
                {exportingPdf ? 'Eksporterer...' : 'Eksporter PDF'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6" ref={contentRef}>
        <Tabs defaultValue="total-costs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="total-costs" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Total Kostnader</span>
              <span className="sm:hidden">Total</span>
            </TabsTrigger>
            <TabsTrigger value="refunds" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Refunderinger</span>
              <span className="sm:hidden">Refund</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Per Leverandør</span>
              <span className="sm:hidden">Leverandør</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Per Produkt</span>
              <span className="sm:hidden">Produkt</span>
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Budsjettsporing</span>
              <span className="sm:hidden">Budsjett</span>
            </TabsTrigger>
          </TabsList>

          {/* Total Costs Tab */}
          <TabsContent value="total-costs" className="space-y-6">
            {costLoading ? (
              <LoadingSkeleton />
            ) : costData ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Kostnad</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(costData.totalCosts.totalClaimCost)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Refundert</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(costData.totalCosts.totalRefunded)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Netto Kostnad</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(costData.totalCosts.netCost)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Forventet Refund</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(costData.totalCosts.expectedRefunds)}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cost Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Kostnadstrend over tid
                    </CardTitle>
                    <CardDescription>Utvikling av kostnader og refunderinger</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      totalCosts: { label: "Total kostnader", color: "hsl(var(--primary))" },
                      totalRefunds: { label: "Refunderinger", color: "hsl(var(--secondary))" },
                      netCosts: { label: "Netto kostnader", color: "hsl(var(--accent))" }
                    }}>
                      {costData.costTrends?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={costData.costTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="totalCosts" stroke="hsl(var(--primary))" strokeWidth={2} />
                            <Line type="monotone" dataKey="totalRefunds" stroke="hsl(var(--secondary))" strokeWidth={2} />
                            <Line type="monotone" dataKey="netCosts" stroke="hsl(var(--accent))" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                       ) : (
                         <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                           <div className="text-center">
                             <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                             <p>Ingen trenddata tilgjengelig for valgt periode</p>
                             <p className="text-sm mt-1">Prøv en lengre tidsperiode eller sjekk at det finnes registrerte krav</p>
                           </div>
                         </div>
                       )}
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-6">
            {costLoading ? (
              <LoadingSkeleton />
            ) : costData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Refunderingsanalyse
                    </CardTitle>
                    <CardDescription>Oversikt over refunderinger fra leverandører</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Forventet</p>
                          <p className="text-lg font-semibold">{formatCurrency(costData.refundAnalysis.totalExpected)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mottatt</p>
                          <p className="text-lg font-semibold">{formatCurrency(costData.refundAnalysis.totalReceived)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Refunderingsgrad</p>
                        <p className="text-2xl font-bold">{costData.refundAnalysis.refundRate.toFixed(1)}%</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Ventende</p>
                          <p className="text-lg font-semibold">{costData.refundAnalysis.pendingRefunds}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fullført</p>
                          <p className="text-lg font-semibold">{costData.refundAnalysis.completedRefunds}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Refunderinger per leverandør</CardTitle>
                    <CardDescription>Refunderingsgrad per leverandør</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costData.refundAnalysis.refundsBySupplier?.length > 0 ? (
                        costData.refundAnalysis.refundsBySupplier.slice(0, 6).map((supplier, index) => (
                          <div key={supplier.supplier || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{supplier.supplier || 'Ukjent leverandør'}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(supplier.expectedRefunds || 0)} forventet
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{(supplier.refundRate || 0).toFixed(1)}%</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(supplier.actualRefunds || 0)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Ingen refunderingsdata tilgjengelig</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Supplier Costs Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            {costLoading ? (
              <LoadingSkeleton />
            ) : costData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Kostnader per leverandør
                    </CardTitle>
                    <CardDescription>Total kostnader rangert per leverandør</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      totalCost: { label: "Total kostnad", color: "hsl(var(--primary))" }
                    }}>
                      {costData.supplierCosts?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={costData.supplierCosts.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="supplier" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="totalCost" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          <p>Ingen leverandørdata tilgjengelig</p>
                        </div>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leverandør detaljer</CardTitle>
                    <CardDescription>Kostnad og refunderingsoversikt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costData.supplierCosts?.length > 0 ? (
                        costData.supplierCosts.slice(0, 6).map((supplier, index) => (
                          <div key={supplier.supplier || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{supplier.supplier || 'Ukjent leverandør'}</p>
                              <p className="text-sm text-muted-foreground">{supplier.claimCount || 0} reklamasjoner</p>
                              <p className="text-sm text-muted-foreground">
                                Ø {formatCurrency(supplier.avgCost || 0)} per krav
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(supplier.totalCost || 0)}</p>
                              <p className="text-sm text-muted-foreground">
                                -{formatCurrency(supplier.totalRefunded || 0)}
                              </p>
                              <p className="text-sm font-medium">
                                = {formatCurrency(supplier.netCost || 0)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Ingen leverandørdata tilgjengelig</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Product Costs Tab */}
          <TabsContent value="products" className="space-y-6">
            {costLoading ? (
              <LoadingSkeleton />
            ) : costData ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Kostnader per produkt
                    </CardTitle>
                    <CardDescription>Produkter med høyest totale kostnader</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{
                      totalCost: { label: "Total kostnad", color: "hsl(var(--secondary))" }
                    }}>
                      {costData.productCosts?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={costData.productCosts.slice(0, 8)} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="productName" type="category" tick={{ fontSize: 10 }} width={100} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="totalCost" fill="hsl(var(--secondary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                          <p>Ingen produktdata tilgjengelig</p>
                        </div>
                      )}
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Produkt detaljer</CardTitle>
                    <CardDescription>Kostnadsoversikt per produkt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costData.productCosts?.length > 0 ? (
                        costData.productCosts.slice(0, 6).map((product, index) => (
                          <div key={`${product.productName}-${product.productModel}` || index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{product.productName || 'Ukjent produkt'}</p>
                              <p className="text-sm text-muted-foreground">{product.productModel || 'Ingen modell'}</p>
                              <p className="text-sm text-muted-foreground">{product.claimCount || 0} reklamasjoner</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(product.totalCost || 0)}</p>
                              <p className="text-sm text-muted-foreground">
                                Ø {formatCurrency(product.avgCost || 0)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Ingen produktdata tilgjengelig</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-6">
            <div className="space-y-6">
              {/* Budget Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    Budsjettsporing {selectedBudgetYear}
                  </h2>
                  <p className="text-muted-foreground">
                    Spor fremgang mot årlige refundmål fra leverandører
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedBudgetYear.toString()}
                    onValueChange={(value) => setSelectedBudgetYear(parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBudgetYears?.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {isAdmin && (
                    <Button onClick={() => {
                      setBudgetFormData({
                        year: selectedBudgetYear,
                        target_amount: 0,
                        department: 'all',
                        supplier_name: '',
                        notes: ''
                      });
                      setEditingTarget(null);
                      setIsBudgetFormOpen(true);
                    }} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Nytt budsjettmål</span>
                      <span className="sm:hidden">Nytt mål</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Overall Progress Card */}
              {budgetProgress && (
                <Card className="animate-fade-in hover-scale">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Totalt budsjett {selectedBudgetYear}
                    </CardTitle>
                    <CardDescription>
                      {budgetProgress.progress_percentage >= 100 ? "🎉 Mål nådd!" 
                       : budgetProgress.progress_percentage >= 90 ? "🔥 Nesten i mål!"
                       : budgetProgress.progress_percentage >= 70 ? "📈 På god vei"
                       : budgetProgress.progress_percentage >= 50 ? "⚡ Halvveis"
                       : "🚀 I gang"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresjon</span>
                        <span className="font-medium">{budgetProgress.progress_percentage}%</span>
                      </div>
                      <Progress 
                        value={budgetProgress.progress_percentage} 
                        className="h-3"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Mål
                        </div>
                        <p className="text-lg font-semibold">
                          {formatCurrency(budgetProgress.target_amount)}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          Refundert
                        </div>
                        <p className="text-lg font-semibold text-success">
                          {formatCurrency(budgetProgress.actual_refunded)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Gjenstår
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(budgetProgress.remaining_amount)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Budget Targets List */}
              <Card>
                <CardHeader>
                  <CardTitle>Budsjettmål för {selectedBudgetYear}</CardTitle>
                  <CardDescription>Alle fastsatte budsjettmål för året</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgetTargets?.filter(t => t.year === selectedBudgetYear).map(target => (
                      <div key={target.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span className="font-medium">
                              {target.department 
                                ? `${target.department.charAt(0).toUpperCase() + target.department.slice(1)} avdeling`
                                : target.supplier_name 
                                ? `Leverandør: ${target.supplier_name}`
                                : "Generelt mål"
                              }
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Målbeløp: {formatCurrency(target.target_amount)}
                          </p>
                          {target.notes && (
                            <p className="text-xs text-muted-foreground">
                              {target.notes}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingTarget(target);
                                setBudgetFormData({
                                  year: target.year,
                                  target_amount: target.target_amount,
                                  department: target.department || 'all',
                                  supplier_name: target.supplier_name || '',
                                  notes: target.notes || ''
                                });
                                setIsBudgetFormOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Slett budsjettmål</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Er du sikker på at du vil slette dette budsjettmålet? Dette kan ikke angres.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteBudgetMutation.mutate(target.id)}>
                                    Slett
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                    )) || []}

                    {(!budgetTargets?.filter(t => t.year === selectedBudgetYear).length) && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Ingen budsjettmål satt for {selectedBudgetYear}</p>
                        {isAdmin && (
                          <p className="text-sm mt-1">
                            Opprett ditt første budsjettmål for å komme i gang
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget Form Dialog */}
              <Dialog open={isBudgetFormOpen} onOpenChange={setIsBudgetFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {editingTarget ? "Rediger budsjettmål" : "Opprett budsjettmål"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!user) return;

                    try {
                      const baseData = {
                        year: budgetFormData.year,
                        target_amount: budgetFormData.target_amount,
                        notes: budgetFormData.notes || null,
                      };

                      const departmentValue = budgetFormData.department && budgetFormData.department !== '' && budgetFormData.department !== 'all' ? budgetFormData.department as any : null;
                      const supplierValue = budgetFormData.supplier_name && budgetFormData.supplier_name !== '' ? budgetFormData.supplier_name : null;

                      if (editingTarget) {
                        await updateBudgetMutation.mutateAsync({
                          id: editingTarget.id,
                          updates: { 
                            ...baseData, 
                            department: departmentValue,
                            supplier_name: supplierValue,
                            updated_by: user.id 
                          },
                        });
                      } else {
                        await createBudgetMutation.mutateAsync({
                          ...baseData,
                          department: departmentValue,
                          supplier_name: supplierValue,
                          created_by: user.id,
                        });
                      }

                      setIsBudgetFormOpen(false);
                      setEditingTarget(null);
                      setBudgetFormData({
                        year: new Date().getFullYear(),
                        target_amount: 0,
                        department: '',
                        supplier_name: '',
                        notes: ''
                      });
                    } catch (error) {
                      console.error('Form submission error:', error);
                    }
                  }} className="space-y-4">
                    <div>
                      <Label htmlFor="budget_year">År</Label>
                      <Input
                        id="budget_year"
                        type="number"
                        value={budgetFormData.year}
                        onChange={(e) => setBudgetFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        min="2020"
                        max="2050"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_target_amount">Målbeløp (NOK)</Label>
                      <Input
                        id="budget_target_amount"
                        type="number"
                        value={budgetFormData.target_amount}
                        onChange={(e) => setBudgetFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_department">Avdeling</Label>
                      <Select
                        value={budgetFormData.department === '' ? 'all' : budgetFormData.department}
                        onValueChange={(value) => setBudgetFormData(prev => ({ ...prev, department: value === 'all' ? '' : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Välj avdeling för specifikt mål" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Generelt mål (alle avdelinger)</SelectItem>
                          <SelectItem value="oslo">Oslo</SelectItem>
                          <SelectItem value="bergen">Bergen</SelectItem>
                          <SelectItem value="trondheim">Trondheim</SelectItem>
                          <SelectItem value="stavanger">Stavanger</SelectItem>
                          <SelectItem value="kristiansand">Kristiansand</SelectItem>
                          <SelectItem value="nord_norge">Nord-Norge</SelectItem>
                          <SelectItem value="innlandet">Innlandet</SelectItem>
                          <SelectItem value="vestfold">Vestfold</SelectItem>
                          <SelectItem value="agder">Agder</SelectItem>
                          <SelectItem value="ekstern">Ekstern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="budget_supplier_name">Leverandør (valgfritt)</Label>
                      <Input
                        id="budget_supplier_name"
                        value={budgetFormData.supplier_name}
                        onChange={(e) => setBudgetFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                        placeholder="Specifiser leverandör för leverandörspecifikt mål"
                      />
                    </div>

                    <div>
                      <Label htmlFor="budget_notes">Notater</Label>
                      <Textarea
                        id="budget_notes"
                        value={budgetFormData.notes}
                        onChange={(e) => setBudgetFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Tilleggsnotater om budsjettmålet..."
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBudgetFormOpen(false)}
                      >
                        Avbryt
                      </Button>
                      <Button
                        type="submit"
                        disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                      >
                        {editingTarget ? "Oppdater" : "Opprett"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalyticsEnhanced;