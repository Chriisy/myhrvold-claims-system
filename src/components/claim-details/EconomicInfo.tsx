import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";

interface EconomicData {
  workHours: number;
  hourlyRate: number;
  partsCost: number;
  travelCost: number;
  consumablesCost: number;
  externalServicesCost: number;
  totalCost: number;
  expectedRefund: number;
  actualRefund?: number;
  refundStatus?: string;
  netCost?: number;
  refundedWorkCost?: number;
  refundedPartsCost?: number;
  refundedTravelCost?: number;
  refundedVehicleCost?: number;
  refundedOtherCost?: number;
  totalRefunded?: number;
}

interface EconomicInfoProps {
  data: EconomicData;
}

export const EconomicInfo = ({ data }: EconomicInfoProps) => {
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return "0 kr";
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRefundStatusColor = (status?: string) => {
    switch (status) {
      case 'received': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const workCost = (data.workHours || 0) * (data.hourlyRate || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Økonomisk informasjon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Kostnadsoversikt */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Kostnadsoversikt
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arbeid ({data.workHours}t × {formatCurrency(data.hourlyRate)}):</span>
                <span className="font-medium">{formatCurrency(workCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deler:</span>
                <span className="font-medium">{formatCurrency(data.partsCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reise:</span>
                <span className="font-medium">{formatCurrency(data.travelCost)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Forbruksmateriell:</span>
                <span className="font-medium">{formatCurrency(data.consumablesCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ekstern service:</span>
                <span className="font-medium">{formatCurrency(data.externalServicesCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total kostnad:</span>
                <span>{formatCurrency(data.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Refusjons informasjon */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Refusjon
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Forventet refusjon:</span>
              <span className="font-medium">{formatCurrency(data.expectedRefund)}</span>
            </div>
            
            {data.actualRefund !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faktisk refusjon:</span>
                <span className="font-medium">{formatCurrency(data.actualRefund)}</span>
              </div>
            )}

            {data.refundStatus && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getRefundStatusColor(data.refundStatus)}>
                  {data.refundStatus === 'received' ? 'Mottatt' : 
                   data.refundStatus === 'pending' ? 'Venter' : 
                   data.refundStatus === 'rejected' ? 'Avvist' : data.refundStatus}
                </Badge>
              </div>
            )}

            {data.netCost !== undefined && (
              <div className="flex justify-between items-center font-semibold border-t pt-2">
                <span>Netto kostnad:</span>
                <span className={data.netCost > 0 ? 'text-red-600' : 'text-green-600'}>
                  {formatCurrency(data.netCost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detaljert refusjon */}
        {(data.refundedWorkCost || data.refundedPartsCost || data.refundedTravelCost || data.refundedVehicleCost || data.refundedOtherCost) && (
          <div>
            <h4 className="font-medium mb-3">Refunderte poster</h4>
            <div className="space-y-2 text-sm">
              {data.refundedWorkCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arbeid refundert:</span>
                  <span>{formatCurrency(data.refundedWorkCost)}</span>
                </div>
              )}
              {data.refundedPartsCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deler refundert:</span>
                  <span>{formatCurrency(data.refundedPartsCost)}</span>
                </div>
              )}
              {data.refundedTravelCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reise refundert:</span>
                  <span>{formatCurrency(data.refundedTravelCost)}</span>
                </div>
              )}
              {data.refundedVehicleCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kjøretøy refundert:</span>
                  <span>{formatCurrency(data.refundedVehicleCost)}</span>
                </div>
              )}
              {data.refundedOtherCost && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Annet refundert:</span>
                  <span>{formatCurrency(data.refundedOtherCost)}</span>
                </div>
              )}
              {data.totalRefunded && (
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total refundert:</span>
                  <span>{formatCurrency(data.totalRefunded)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};