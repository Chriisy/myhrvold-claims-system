import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, DollarSign, CheckCircle } from "lucide-react";
import type { SupplierScorecard } from "@/services/supplierScorecardService";

interface SupplierScorecardCardProps {
  scorecard: SupplierScorecard;
  rank?: number;
}

export function SupplierScorecardCard({ scorecard, rank }: SupplierScorecardCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {rank && (
              <Badge variant="outline" className="text-xs">
                #{rank}
              </Badge>
            )}
            <CardTitle className="text-lg">{scorecard.supplier_name}</CardTitle>
          </div>
          <Badge 
            variant={getScoreBadgeVariant(scorecard.score)}
            className="text-sm font-bold"
          >
            {scorecard.score}/100
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Totalscore</span>
            <span className={getScoreColor(scorecard.score)}>{scorecard.score}%</span>
          </div>
          <Progress value={scorecard.score} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{scorecard.total_claims}</div>
              <div className="text-muted-foreground">Totale saker</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">
                {scorecard.avg_response_time_days ? `${scorecard.avg_response_time_days}d` : 'N/A'}
              </div>
              <div className="text-muted-foreground">Snitt responstid</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{scorecard.refund_rate}%</div>
              <div className="text-muted-foreground">Refund rate</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{formatCurrency(scorecard.total_cost)}</div>
              <div className="text-muted-foreground">Total kostnad</div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Aktive: {scorecard.active_claims}</span>
            <span>Løst: {scorecard.resolved_claims}</span>
            <span>Refundert: {formatCurrency(scorecard.total_refunded)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}