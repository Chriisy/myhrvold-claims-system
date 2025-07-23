import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TrendingUp, DollarSign, Package, Building2, FileDown, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCostAnalytics } from "@/hooks/useDashboardData";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AnalyticsEnhanced = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState("6m");
  const [exportingPdf, setExportingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { data: costData, isLoading: costLoading } = useCostAnalytics(timeRange);

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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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
                      {costData.refundAnalysis.refundsBySupplier.slice(0, 6).map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{supplier.supplier}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(supplier.expectedRefunds)} forventet
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{supplier.refundRate.toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(supplier.actualRefunds)}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData.supplierCosts.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="supplier" tick={{ fontSize: 12 }} />
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
                    <CardTitle>Leverandør detaljer</CardTitle>
                    <CardDescription>Kostnad og refunderingsoversikt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {costData.supplierCosts.slice(0, 6).map((supplier, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{supplier.supplier}</p>
                            <p className="text-sm text-muted-foreground">{supplier.claimCount} reklamasjoner</p>
                            <p className="text-sm text-muted-foreground">
                              Ø {formatCurrency(supplier.avgCost)} per krav
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(supplier.totalCost)}</p>
                            <p className="text-sm text-muted-foreground">
                              -{formatCurrency(supplier.totalRefunded)}
                            </p>
                            <p className="text-sm font-medium">
                              = {formatCurrency(supplier.netCost)}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData.productCosts.slice(0, 8)} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="productName" type="category" tick={{ fontSize: 10 }} width={100} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="totalCost" fill="hsl(var(--secondary))" />
                        </BarChart>
                      </ResponsiveContainer>
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
                      {costData.productCosts.slice(0, 6).map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">{product.productModel}</p>
                            <p className="text-sm text-muted-foreground">{product.claimCount} reklamasjoner</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(product.totalCost)}</p>
                            <p className="text-sm text-muted-foreground">
                              Ø {formatCurrency(product.avgCost)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AnalyticsEnhanced;