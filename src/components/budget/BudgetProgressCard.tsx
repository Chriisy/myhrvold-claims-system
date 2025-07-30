import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, DollarSign } from "lucide-react";
import type { BudgetProgress } from "@/services/budgetService";

interface BudgetProgressCardProps {
  progress: BudgetProgress;
  year: number;
  title?: string;
  isLoading?: boolean;
}

export const BudgetProgressCard = ({ 
  progress, 
  year, 
  title = "Totalt budsjett",
  isLoading = false 
}: BudgetProgressCardProps) => {
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

  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {title} {year}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 bg-muted animate-pulse rounded" />
          <div className="h-6 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted animate-pulse rounded" />
            <div className="h-16 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in hover-scale">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {title} {year}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getProgressStatus(progress.progress_percentage)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresjon</span>
            <span className="font-medium">{progress.progress_percentage}%</span>
          </div>
          <Progress 
            value={progress.progress_percentage} 
            className={`h-3 ${getProgressColor(progress.progress_percentage)}`}
          />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Mål
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(progress.target_amount)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Refundert
            </div>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(progress.actual_refunded)}
            </p>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              Gjenstår
            </div>
            <p className="text-sm font-medium">
              {formatCurrency(progress.remaining_amount)}
            </p>
          </div>
        </div>

        {/* Prediction (simple calculation) */}
        {progress.actual_refunded > 0 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            {progress.progress_percentage >= 100 
              ? "🎯 Målet er nådd!"
              : `Basert på nåværende tempo estimeres målet nådd ${
                  progress.progress_percentage > 0 
                    ? `om ${Math.ceil((100 - progress.progress_percentage) / (progress.progress_percentage / (new Date().getMonth() + 1)))} måneder`
                    : "etter planlagt tid"
                }`
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};