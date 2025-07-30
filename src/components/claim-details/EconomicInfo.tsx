import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";
import { currencyService, Currency } from "@/services/currencyService";

interface CustomLineItem {
  id: string;
  partNumber?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface EconomicData {
  workHours: number;
  hourlyRate: number;
  currency?: Currency;
  overtime50Hours?: number;
  overtime100Hours?: number;
  travelHours?: number;
  travelDistanceKm?: number;
  vehicleCostPerKm?: number;
  customLineItems?: CustomLineItem[];
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
  const inputCurrency = data.currency || 'NOK';
  
  const formatCurrency = (amount: number | undefined | null, showInputCurrency: boolean = false) => {
    if (!amount && amount !== 0) return "0 kr";
    
    if (showInputCurrency && inputCurrency === 'EUR') {
      return `${currencyService.format(amount, 'EUR')} (${currencyService.formatWithConversion(amount, 'EUR')})`;
    }
    
    // Always show NOK equivalent for final display
    return currencyService.formatWithConversion(amount, inputCurrency);
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
  const overtime50Cost = (data.overtime50Hours || 0) * (data.hourlyRate || 0) * 1.5;
  const overtime100Cost = (data.overtime100Hours || 0) * (data.hourlyRate || 0) * 2;
  const travelTimeCost = (data.travelHours || 0) * (data.hourlyRate || 0);
  const vehicleCost = (data.travelDistanceKm || 0) * (data.vehicleCostPerKm || 7.5);
  const customLineItemsTotal = (data.customLineItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Økonomisk informasjon
          </div>
          {inputCurrency === 'EUR' && (
            <Badge variant="outline" className="text-xs">
              Kostnader oppgitt i EUR
            </Badge>
          )}
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
                 <span className="text-muted-foreground">Arbeid ({data.workHours}t):</span>
                 <span className="font-medium">{formatCurrency(workCost)}</span>
               </div>
               {data.overtime50Hours && data.overtime50Hours > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Overtid 50% ({data.overtime50Hours}t):</span>
                   <span className="font-medium">{formatCurrency(overtime50Cost)}</span>
                 </div>
               )}
               {data.overtime100Hours && data.overtime100Hours > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Overtid 100% ({data.overtime100Hours}t):</span>
                   <span className="font-medium">{formatCurrency(overtime100Cost)}</span>
                 </div>
               )}
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Deler:</span>
                 <span className="font-medium">{formatCurrency(data.partsCost)}</span>
               </div>
               {travelTimeCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Reisetid ({data.travelHours}t):</span>
                   <span className="font-medium">{formatCurrency(travelTimeCost)}</span>
                 </div>
               )}
               {vehicleCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Kjøretøy ({data.travelDistanceKm} km):</span>
                   <span className="font-medium">{formatCurrency(vehicleCost)}</span>
                 </div>
               )}
               {data.travelCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Andre reiseutgifter:</span>
                   <span className="font-medium">{formatCurrency(data.travelCost)}</span>
                 </div>
               )}
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
              {customLineItemsTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tilpassede poster:</span>
                  <span className="font-medium">{formatCurrency(customLineItemsTotal)}</span>
                </div>
              )}
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
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total refundert:</span>
              <span className="font-medium">{formatCurrency(data.totalRefunded || 0)}</span>
            </div>

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

            <div className="flex justify-between items-center font-semibold border-t pt-2">
              <span>Netto kostnad:</span>
              <span className={data.netCost > 0 ? 'text-red-600' : 'text-green-600'}>
                {formatCurrency(data.netCost)}
              </span>
            </div>
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

        {/* Custom Line Items Details */}
        {data.customLineItems && data.customLineItems.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Tilpassede poster</h4>
            <div className="space-y-3">
              {data.customLineItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-3 bg-muted/30">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Delenr:</span>
                      <div>{item.partNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Beskrivelse:</span>
                      <div>{item.description || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Antall:</span>
                      <div>{item.quantity}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Pris:</span>
                      <div>{formatCurrency(item.unitPrice)}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Totalt for denne delen:</span>
                    <span className="font-medium">{formatCurrency(item.quantity * item.unitPrice)}</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total tilpassede poster:</span>
                <span>{formatCurrency(customLineItemsTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};