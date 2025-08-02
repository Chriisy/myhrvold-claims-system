import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupplierScorecardCard } from "@/components/supplier/SupplierScorecardCard";
import { SupplierRankingTable } from "@/components/supplier/SupplierRankingTable";
import { useSupplierScorecards, useTopSuppliers } from "@/hooks/useSupplierScorecard";
import { TrendingUp, TrendingDown, Target, BarChart3, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading";
import { Link } from "react-router-dom";

export default function SupplierScorecard() {
  const { data: allScorecards, isLoading } = useSupplierScorecards();
  const { data: topSuppliers } = useTopSuppliers(3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const bottomSuppliers = allScorecards?.slice(-3).reverse() || [];
  const averageScore = allScorecards?.length 
    ? Math.round(allScorecards.reduce((sum, s) => sum + s.score, 0) / allScorecards.length)
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leverandør-scorecard</h1>
            <p className="text-muted-foreground">
              Rangering og ytelse av leverandører basert på responstid, refund-rate og kostnader
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {allScorecards?.length || 0} leverandører
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gjennomsnittsscore</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}/100</div>
            <p className="text-xs text-muted-foreground">
              Alle leverandører
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beste score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSuppliers?.[0]?.score || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {topSuppliers?.[0]?.supplier_name || 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laveste score</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bottomSuppliers?.[0]?.score || 0}/100
            </div>
            <p className="text-xs text-muted-foreground">
              {bottomSuppliers?.[0]?.supplier_name || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="ranking">Fullstendig rangering</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Topp 3 leverandører
              </CardTitle>
              <CardDescription>
                Leverandører med høyest totalScore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {topSuppliers?.map((supplier, index) => (
                  <SupplierScorecardCard
                    key={supplier.supplier_name}
                    scorecard={supplier}
                    rank={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bottom Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Fokusområder
              </CardTitle>
              <CardDescription>
                Leverandører som trenger oppfølging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {bottomSuppliers.map((supplier, index) => (
                  <SupplierScorecardCard
                    key={supplier.supplier_name}
                    scorecard={supplier}
                    rank={(allScorecards?.length || 0) - bottomSuppliers.length + index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ranking">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Fullstendig leverandør-rangering
              </CardTitle>
              <CardDescription>
                Alle leverandører sortert etter totalScore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierRankingTable 
                scorecards={allScorecards || []} 
                loading={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}