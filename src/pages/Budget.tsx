import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, TrendingUp, Calendar, Settings, Edit, Trash2 } from "lucide-react";
import { BudgetProgressCard } from "@/components/budget/BudgetProgressCard";
import { BudgetTargetForm } from "@/components/budget/BudgetTargetForm";
import { useBudgetProgress, useBudgetTargetsByYear, useAvailableYears, useDeleteBudgetTarget } from "@/hooks/useBudget";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Budget() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const { data: availableYears, isLoading: yearsLoading } = useAvailableYears();
  const { data: targets, isLoading: targetsLoading } = useBudgetTargetsByYear(selectedYear);
  const { data: overallProgress, isLoading: progressLoading } = useBudgetProgress(selectedYear);
  const deleteMutation = useDeleteBudgetTarget();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDeleteTarget = async (targetId: string) => {
    await deleteMutation.mutateAsync(targetId);
  };

  // Get department-specific targets
  const departmentTargets = targets?.filter(t => t.department && !t.supplier_name) || [];
  const supplierTargets = targets?.filter(t => t.supplier_name && !t.department) || [];
  const generalTarget = targets?.find(t => !t.department && !t.supplier_name);

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8 text-primary" />
            Budsjettsporing
          </h1>
          <p className="text-muted-foreground">
            Spor fremgang mot årlige refundmål fra leverandører
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears?.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isAdmin && (
            <BudgetTargetForm defaultYear={selectedYear} />
          )}
        </div>
      </div>

      {/* Overall Progress */}
      {overallProgress && (
        <BudgetProgressCard
          progress={overallProgress}
          year={selectedYear}
          title="Totalt budsjett"
          isLoading={progressLoading}
        />
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Oversikt</TabsTrigger>
          <TabsTrigger value="targets">Budsjettmål</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Department Progress Cards */}
          {departmentTargets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Avdelingsmål
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departmentTargets.map(target => (
                  <BudgetProgressCard
                    key={target.id}
                    progress={overallProgress} // TODO: Get department-specific progress
                    year={selectedYear}
                    title={target.department ? target.department.charAt(0).toUpperCase() + target.department.slice(1) : 'Ukjent'}
                    isLoading={progressLoading}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Supplier Progress Cards */}
          {supplierTargets.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Leverandørmål</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supplierTargets.map(target => (
                  <BudgetProgressCard
                    key={target.id}
                    progress={overallProgress} // TODO: Get supplier-specific progress
                    year={selectedYear}
                    title={target.supplier_name || 'Ukjent leverandør'}
                    isLoading={progressLoading}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Budsjettmål for {selectedYear}</h2>
            {isAdmin && (
              <BudgetTargetForm 
                defaultYear={selectedYear}
                trigger={
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Administrer mål
                  </Button>
                }
              />
            )}
          </div>

          <div className="space-y-4">
            {targets?.map(target => (
              <Card key={target.id} className="hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {target.department 
                        ? `${target.department.charAt(0).toUpperCase() + target.department.slice(1)} avdeling`
                        : target.supplier_name 
                        ? `Leverandør: ${target.supplier_name}`
                        : "Generelt mål"
                      }
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <BudgetTargetForm
                          editTarget={target}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
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
                              <AlertDialogAction onClick={() => handleDeleteTarget(target.id)}>
                                Slett
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Målbeløp:</span>
                      <span className="font-medium">{formatCurrency(target.target_amount)}</span>
                    </div>
                    {target.notes && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Notater:</strong> {target.notes}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Opprettet: {new Date(target.created_at).toLocaleDateString('nb-NO')}
                      {target.updated_at !== target.created_at && (
                        <> • Oppdatert: {new Date(target.updated_at).toLocaleDateString('nb-NO')}</>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen budsjettmål satt for {selectedYear}
                  {isAdmin && (
                    <div className="mt-4">
                      <BudgetTargetForm defaultYear={selectedYear} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse og prognoser</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Kommende funksjonalitet: Detaljert analyse av budsjettprestasjoner, 
                trender og prognoser basert på historiske data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}