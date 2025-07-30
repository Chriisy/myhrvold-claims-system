import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, Edit, Trash2, Calendar, TrendingUp, DollarSign, Clock } from "lucide-react";
import { useBudgetTargets, useCreateBudgetTarget, useUpdateBudgetTarget, useDeleteBudgetTarget, useBudgetProgress, useAvailableYears } from "@/hooks/useBudget";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BudgetTarget } from "@/services/budgetService";

interface BudgetFormData {
  year: number;
  target_amount: number;
  department?: string;
  supplier_name?: string;
  notes?: string;
}

export default function Budget() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<BudgetTarget | null>(null);
  const [formData, setFormData] = useState<BudgetFormData>({
    year: new Date().getFullYear(),
    target_amount: 0,
    department: '',
    supplier_name: '',
    notes: ''
  });

  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const { data: availableYears, isLoading: yearsLoading } = useAvailableYears();
  const { data: targets, isLoading: targetsLoading } = useBudgetTargets();
  const { data: overallProgress, isLoading: progressLoading } = useBudgetProgress(selectedYear);
  
  const createMutation = useCreateBudgetTarget();
  const updateMutation = useUpdateBudgetTarget();
  const deleteMutation = useDeleteBudgetTarget();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 70) return "bg-warning";
    return "bg-primary";
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return "🎉 Mål nådd!";
    if (percentage >= 90) return "🔥 Nesten i mål!";
    if (percentage >= 70) return "📈 På god vei";
    if (percentage >= 50) return "⚡ Halvveis";
    return "🚀 I gang";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const baseData = {
        year: formData.year,
        target_amount: formData.target_amount,
        notes: formData.notes || null,
      };

      // Handle department type conversion
      const departmentValue = formData.department && formData.department !== '' ? formData.department as any : null;
      const supplierValue = formData.supplier_name && formData.supplier_name !== '' ? formData.supplier_name : null;

      if (editingTarget) {
        await updateMutation.mutateAsync({
          id: editingTarget.id,
          updates: { 
            ...baseData, 
            department: departmentValue,
            supplier_name: supplierValue,
            updated_by: user.id 
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...baseData,
          department: departmentValue,
          supplier_name: supplierValue,
          created_by: user.id,
        });
      }

      setIsFormOpen(false);
      setEditingTarget(null);
      setFormData({
        year: new Date().getFullYear(),
        target_amount: 0,
        department: '',
        supplier_name: '',
        notes: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const openEditForm = (target: BudgetTarget) => {
    setEditingTarget(target);
    setFormData({
      year: target.year,
      target_amount: target.target_amount,
      department: target.department || '',
      supplier_name: target.supplier_name || '',
      notes: target.notes || ''
    });
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingTarget(null);
    setFormData({
      year: selectedYear,
      target_amount: 0,
      department: '',
      supplier_name: '',
      notes: ''
    });
    setIsFormOpen(true);
  };

  const currentYearTargets = targets?.filter(t => t.year === selectedYear) || [];

  const departments = [
    { value: "oslo", label: "Oslo" },
    { value: "bergen", label: "Bergen" },
    { value: "trondheim", label: "Trondheim" },
    { value: "stavanger", label: "Stavanger" },
    { value: "kristiansand", label: "Kristiansand" },
    { value: "nord_norge", label: "Nord-Norge" },
    { value: "innlandet", label: "Innlandet" },
    { value: "vestfold", label: "Vestfold" },
    { value: "agder", label: "Agder" },
    { value: "ekstern", label: "Ekstern" },
  ];

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
            <Button onClick={openNewForm} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nytt budsjettmål
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress Card */}
      {overallProgress && (
        <Card className="animate-fade-in hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Totalt budsjett {selectedYear}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {getProgressStatus(overallProgress.progress_percentage)}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresjon</span>
                <span className="font-medium">{overallProgress.progress_percentage}%</span>
              </div>
              <Progress 
                value={overallProgress.progress_percentage} 
                className={`h-3 ${getProgressColor(overallProgress.progress_percentage)}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  Mål
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(overallProgress.target_amount)}
                </p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Refundert
                </div>
                <p className="text-lg font-semibold text-success">
                  {formatCurrency(overallProgress.actual_refunded)}
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
                  {formatCurrency(overallProgress.remaining_amount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="targets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="targets">Budsjettmål</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
        </TabsList>

        <TabsContent value="targets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Budsjettmål for {selectedYear}</h2>
          </div>

          <div className="space-y-4">
            {currentYearTargets.map(target => (
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
                        <Button variant="outline" size="sm" onClick={() => openEditForm(target)}>
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
                              <AlertDialogAction onClick={() => deleteMutation.mutate(target.id)}>
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {currentYearTargets.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Ingen budsjettmål satt for {selectedYear}
                  {isAdmin && (
                    <div className="mt-4">
                      <Button onClick={openNewForm}>Opprett budsjettmål</Button>
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
                trender och prognoser basert på historiska data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Budget Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {editingTarget ? "Rediger budsjettmål" : "Opprett budsjettmål"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="year">År</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                min="2020"
                max="2050"
                required
              />
            </div>

            <div>
              <Label htmlFor="target_amount">Målbeløp (NOK)</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="department">Avdeling (valgfritt)</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg avdeling eller la stå tom for generelt mål" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Generelt mål (alle avdelinger)</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supplier_name">Leverandør (valgfritt)</Label>
              <Input
                id="supplier_name"
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                placeholder="La stå tom for generelt mål eller spesifiser leverandør"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notater</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Tilleggsnotater om budsjettmålet..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingTarget ? "Oppdater" : "Opprett"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}