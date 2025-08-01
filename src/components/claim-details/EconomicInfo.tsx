import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, DollarSign } from "lucide-react";
import { currencyService, Currency } from "@/services/currencyService";

interface CustomLineItem {
  id: string;
  partNumber?: string; // Artikkelnummer - kan være maskin, reservedel osv
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
  creditNoteNumber?: string;
  refundDateReceived?: string;
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
      <CardContent className="space-y-8">
        
        {/* Kostnadsoversikt */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2 pb-2 border-b">
            <DollarSign className="h-4 w-4" />
            Kostnadsoversikt
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arbeidskostnader */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Arbeid & Reisetid</h5>
              <div className="space-y-2">
                {data.workHours > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Arbeid ({data.workHours}t)</span>
                    <span className="font-medium">{formatCurrency(workCost)}</span>
                  </div>
                )}
                {data.overtime50Hours && data.overtime50Hours > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Overtid 50% ({data.overtime50Hours}t)</span>
                    <span className="font-medium">{formatCurrency(overtime50Cost)}</span>
                  </div>
                )}
                {data.overtime100Hours && data.overtime100Hours > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Overtid 100% ({data.overtime100Hours}t)</span>
                    <span className="font-medium">{formatCurrency(overtime100Cost)}</span>
                  </div>
                )}
                {travelTimeCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Reisetid ({data.travelHours}t)</span>
                    <span className="font-medium">{formatCurrency(travelTimeCost)}</span>
                  </div>
                )}
                {vehicleCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Kjøretøy ({data.travelDistanceKm} km)</span>
                    <span className="font-medium">{formatCurrency(vehicleCost)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Andre kostnader */}
            <div className="space-y-3">
              <h5 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Materialer & Tjenester</h5>
              <div className="space-y-2">
                {data.partsCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Deler</span>
                    <span className="font-medium">{formatCurrency(data.partsCost)}</span>
                  </div>
                )}
                {customLineItemsTotal > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Tilpassede poster</span>
                    <span className="font-medium">{formatCurrency(customLineItemsTotal)}</span>
                  </div>
                )}
                {data.consumablesCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Forbruksmateriell</span>
                    <span className="font-medium">{formatCurrency(data.consumablesCost)}</span>
                  </div>
                )}
                {data.externalServicesCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Ekstern service</span>
                    <span className="font-medium">{formatCurrency(data.externalServicesCost)}</span>
                  </div>
                )}
                {data.travelCost > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm">Andre reiseutgifter</span>
                    <span className="font-medium">{formatCurrency(data.travelCost)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Total kostnad */}
          <div className="bg-muted/30 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Total kostnad:</span>
              <span className="font-bold text-xl">{formatCurrency(data.totalCost)}</span>
            </div>
          </div>
        </div>

        {/* Tilpassede poster - flyttet opp */}
        {data.customLineItems && data.customLineItems.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2 pb-2 border-b">
              <Calculator className="h-4 w-4" />
              Tilpassede poster
            </h4>
            
            <div className="space-y-4">
              {data.customLineItems.map((item, index) => {
                const itemTotal = item.quantity * item.unitPrice;
                const itemRefund = data.refundedPartsCost && customLineItemsTotal > 0 ? 
                  (itemTotal / customLineItemsTotal) * data.refundedPartsCost : 0;
                const itemNetCost = itemTotal - itemRefund;
                
                return (
                  <div key={item.id} className="border rounded-lg p-4 bg-muted/20">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Artikkelnummer</span>
                        <div className="font-medium">{item.partNumber || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Beskrivelse</span>
                        <div className="font-medium">{item.description}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Antall</span>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Enhetspris</span>
                        <div className="font-medium">{formatCurrency(item.unitPrice, true)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Total kostnad</div>
                        <div className="font-bold text-blue-700 dark:text-blue-400">{formatCurrency(itemTotal)}</div>
                      </div>
                      
                      {itemRefund > 0 && (
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Refundert</div>
                          <div className="font-bold text-green-700 dark:text-green-400">
                            -{formatCurrency(itemRefund)}
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Netto kostnad</div>
                        <div className="font-bold text-red-700 dark:text-red-400">{formatCurrency(itemNetCost)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Sammendrag tilpassede poster */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total tilpassede poster:</span>
                  <div className="text-right space-y-1">
                    <div className="font-bold text-lg">{formatCurrency(customLineItemsTotal)}</div>
                    {data.refundedPartsCost > 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        - {formatCurrency(data.refundedPartsCost)} refundert
                      </div>
                    )}
                    <div className="text-sm font-bold text-red-600 dark:text-red-400 border-t pt-1">
                      = {formatCurrency(customLineItemsTotal - (data.refundedPartsCost || 0))} netto
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detaljert refusjon - kun vis hvis det finnes data */}
        {(data.refundedWorkCost || data.refundedPartsCost || data.refundedTravelCost || data.refundedVehicleCost || data.refundedOtherCost) && (
          <div className="space-y-4">
            <h4 className="font-semibold text-lg pb-2 border-b">Refunderte poster</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.refundedWorkCost && (
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Arbeid refundert</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(data.refundedWorkCost)}</span>
                </div>
              )}
              {data.refundedPartsCost && (
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Deler refundert</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(data.refundedPartsCost)}</span>
                </div>
              )}
              {data.refundedTravelCost && (
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Reise refundert</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(data.refundedTravelCost)}</span>
                </div>
              )}
              {data.refundedVehicleCost && (
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Kjøretøy refundert</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(data.refundedVehicleCost)}</span>
                </div>
              )}
              {data.refundedOtherCost && (
                <div className="flex justify-between items-center py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="text-sm">Annet refundert</span>
                  <span className="font-medium text-green-700 dark:text-green-400">{formatCurrency(data.refundedOtherCost)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Refusjonsinformasjon - flyttet til bunnen */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg flex items-center gap-2 pb-2 border-b">
            <TrendingUp className="h-4 w-4" />
            Refusjonsinformasjon
          </h4>
          
          <div className="bg-muted/20 rounded-lg p-4 space-y-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">
              Kredittnotas og refusjonsdetaljer
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.creditNoteNumber && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Kreditnota nummer</span>
                  <div className="font-medium">{data.creditNoteNumber}</div>
                </div>
              )}
              
              {data.refundDateReceived && (
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Refusjonsdato mottatt</span>
                  <div className="font-medium">
                    {new Date(data.refundDateReceived).toLocaleDateString('no-NO')}
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Forventet refusjon</span>
                <div className="font-medium">{formatCurrency(data.expectedRefund)}</div>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Faktisk refusjon</span>
                <div className="font-medium">{formatCurrency(data.totalRefunded || 0)}</div>
              </div>
            </div>

            {data.refundStatus && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium">Refusjonsstatus:</span>
                <Badge className={getRefundStatusColor(data.refundStatus)}>
                  {data.refundStatus === 'received' ? 'Mottatt' : 
                   data.refundStatus === 'pending' ? 'Venter' : 
                   data.refundStatus === 'rejected' ? 'Avvist' : 
                   data.refundStatus === 'completed' ? 'Fullført' : data.refundStatus}
                </Badge>
              </div>
            )}
          </div>

          {/* Netto kostnad fremhevet */}
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">Netto kostnad:</span>
              <span className={`font-bold text-xl ${(data.totalCost - (data.totalRefunded || 0)) > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(data.totalCost - (data.totalRefunded || 0))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};