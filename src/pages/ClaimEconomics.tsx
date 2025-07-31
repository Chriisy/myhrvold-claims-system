import { useParams, Link } from 'react-router-dom';
import { useClaim } from '@/hooks/useClaim';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Edit, Save, X, ArrowLeft, Home } from "lucide-react";
import { useState } from 'react';
import { useUpdateClaimStatus } from '@/hooks/useClaimMutations';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { supabase } from '@/integrations/supabase/client';
import { ClaimAttachments } from '@/components/claim-details/ClaimAttachments';
import { currencyService, Currency } from '@/services/currencyService';

const ACCOUNT_CODES = [
  { code: '4506', description: 'Intern service reklamasjon + GW', type: 'service_callback' },
  { code: '7550', description: 'Ekstern garantikostnad', type: 'warranty' },
  { code: '7555', description: 'Intern garantikostnad', type: 'claim' },
  { code: '7560', description: 'Ekstern GW salg', type: 'warranty' },
  { code: '7565', description: 'Intern GW salg', type: 'claim' },
  { code: '7566', description: 'Utvidet garanti internt/eksternt', type: 'extended_warranty' }
];

export const ClaimEconomics = () => {
  const { id } = useParams<{ id: string }>();
  const { data: claim, isLoading } = useClaim(id);
  const { showSuccess, showError } = useEnhancedToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    account_code: '',
    account_string: ''
  });

  const handleFilesUpdate = async (updatedFiles: any[]) => {
    // This will be called from ClaimAttachments component when files are updated
    // The component handles the database update, so we just need to invalidate queries
    // The useClaim hook will automatically refetch the updated data
  };

  if (isLoading) {
    return <div>Laster...</div>;
  }

  if (!claim) {
    return <div>Reklamasjon ikke funnet</div>;
  }

  const handleEdit = () => {
    setEditData({
      account_code: claim.account_code || '',
      account_string: claim.account_string || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('claims')
        .update({
          account_code: editData.account_code,
          account_string: editData.account_string
        })
        .eq('id', id);

      if (error) throw error;

      setIsEditing(false);
      showSuccess("Oppdatert", "Kontokode er oppdatert");
    } catch (error) {
      showError("Feil", "Kunne ikke oppdatere kontokode");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      account_code: claim.account_code || '',
      account_string: claim.account_string || ''
    });
  };

  const handleAccountCodeChange = (code: string) => {
    const accountInfo = ACCOUNT_CODES.find(ac => ac.code === code);
    if (accountInfo) {
      setEditData({
        account_code: code,
        account_string: `${code};${claim.product_name};${claim.customer_name}`
      });
    }
  };

  const formatCurrency = (amount: number | undefined | null, inputCurrency: Currency = 'NOK') => {
    if (!amount && amount !== 0) return "0 kr";
    
    // Always display final amounts in NOK
    return currencyService.formatWithConversion(amount, inputCurrency);
  };

  // Type-safe access to claim properties
  const claimData = claim as Record<string, any>;
  const inputCurrency = (claimData.currency as Currency) || 'NOK';
  
  const workCost = Number(claimData.work_hours || 0) * Number(claimData.hourly_rate || 0);
  const overtime50Cost = Number(claimData.overtime_50_hours || 0) * Number(claimData.hourly_rate || 0) * 1.5;
  const overtime100Cost = Number(claimData.overtime_100_hours || 0) * Number(claimData.hourly_rate || 0) * 2;
  const travelTimeCost = Number(claimData.travel_hours || 0) * Number(claimData.hourly_rate || 0);
  const vehicleCost = Number(claimData.travel_distance_km || 0) * Number(claimData.vehicle_cost_per_km || 7.5);
  const customLineItems = claimData.custom_line_items;
  const customLineItemsArray = (() => {
    if (!customLineItems) return [];
    if (Array.isArray(customLineItems)) return customLineItems;
    if (typeof customLineItems === 'string') {
      try {
        return JSON.parse(customLineItems);
      } catch {
        return [];
      }
    }
    return [];
  })();
  const customLineItemsTotal = customLineItemsArray.reduce((sum: number, item: any) => 
    sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  
  const partsCost = Number(claimData.parts_cost || 0);
  const travelCost = Number(claimData.travel_cost || 0);  
  const consumablesCost = Number(claimData.consumables_cost || 0);
  const externalServicesCost = Number(claimData.external_services_cost || 0);
  
  // Avoid double counting: if custom line items exist, use them instead of parts_cost
  const actualPartsCost = customLineItemsTotal > 0 ? customLineItemsTotal : partsCost;
  
  const totalCost = workCost + overtime50Cost + overtime100Cost + travelTimeCost + vehicleCost + 
                   actualPartsCost + travelCost + consumablesCost + externalServicesCost;
  const totalRefunded = Number(claimData.refunded_work_cost || 0) + Number(claimData.refunded_parts_cost || 0) + 
                       Number(claimData.refunded_travel_cost || 0) + Number(claimData.refunded_vehicle_cost || 0) + 
                       Number(claimData.refunded_other_cost || 0);
  const netCost = totalCost - totalRefunded;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link to="/claims">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tilbake til reklamasjoner
          </Button>
        </Link>
      </div>
      {/* Regnskapsinformasjon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Regnskapsinformasjon
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Rediger
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-1" />
                  Lagre
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Avbryt
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="account_code">Kontokode</Label>
                <Select value={editData.account_code} onValueChange={handleAccountCodeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kontokode" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_CODES.map((account) => (
                      <SelectItem key={account.code} value={account.code}>
                        {account.code} - {account.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="account_string">Kontostreng</Label>
                <Input
                  id="account_string"
                  value={editData.account_string}
                  onChange={(e) => setEditData({ ...editData, account_string: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Kontokode</div>
                <div className="font-medium">{claim.account_code || 'Ikke satt'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Kontostreng</div>
                <div className="font-medium text-sm break-all">{claim.account_string || 'Ikke satt'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kostnadsoversikt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kostnadsoversikt</span>
            {inputCurrency === 'EUR' && (
              <Badge variant="outline" className="text-xs">
                Kostnader oppgitt i EUR
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arbeid ({Number(claimData.work_hours || 0)}t):</span>
                <span className="font-medium">{formatCurrency(workCost, inputCurrency)}</span>
              </div>
              {overtime50Cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overtid 50% ({Number(claimData.overtime_50_hours || 0)}t):</span>
                  <span className="font-medium">{formatCurrency(overtime50Cost, inputCurrency)}</span>
                </div>
              )}
              {overtime100Cost > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overtid 100% ({Number(claimData.overtime_100_hours || 0)}t):</span>
                  <span className="font-medium">{formatCurrency(overtime100Cost, inputCurrency)}</span>
                </div>
              )}
               {/* Only show parts_cost if no custom line items exist to avoid double counting */}
               {customLineItemsArray.length === 0 && partsCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Deler:</span>
                   <span className="font-medium">{formatCurrency(partsCost, inputCurrency)}</span>
                 </div>
               )}
               {travelTimeCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Reisetid ({Number(claimData.travel_hours || 0)}t):</span>
                   <span className="font-medium">{formatCurrency(travelTimeCost, inputCurrency)}</span>
                 </div>
               )}
               {vehicleCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Kjøretøy ({Number(claimData.travel_distance_km || 0)} km):</span>
                   <span className="font-medium">{formatCurrency(vehicleCost, inputCurrency)}</span>
                 </div>
               )}
               {travelCost > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-muted-foreground">Andre reiseutgifter:</span>
                   <span className="font-medium">{formatCurrency(travelCost, inputCurrency)}</span>
                 </div>
               )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Forbruksmateriell:</span>
                <span className="font-medium">{formatCurrency(consumablesCost, inputCurrency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ekstern service:</span>
                <span className="font-medium">{formatCurrency(externalServicesCost, inputCurrency)}</span>
              </div>
              {customLineItemsArray.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground border-b pb-1">Reservedeler brukt:</div>
                  {customLineItemsArray.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm pl-2">
                      <span className="text-muted-foreground">
                        {item.description || item.partNumber || `Del ${index + 1}`}
                        {item.quantity && ` (${item.quantity} stk)`}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(Number(item.quantity || 1) * Number(item.unitPrice || 0), inputCurrency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-medium border-t pt-1">
                    <span className="text-muted-foreground">Total reservedeler:</span>
                    <span className="font-medium">{formatCurrency(customLineItemsTotal, inputCurrency)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total kostnad:</span>
                <span>{formatCurrency(totalCost, inputCurrency)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refusjonsinformasjon */}
      <Card>
        <CardHeader>
          <CardTitle>Refusjon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Forventet refusjon:</span>
              <span className="font-medium">{formatCurrency(Number(claimData.expected_refund || 0))}</span>
            </div>
            
            {claimData.actual_refund !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faktisk refusjon:</span>
                <span className="font-medium">{formatCurrency(Number(claimData.actual_refund || 0))}</span>
              </div>
            )}

            {claimData.refund_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={
                  claimData.refund_status === 'received' ? 'default' : 
                  claimData.refund_status === 'pending' ? 'secondary' : 
                  'destructive'
                }>
                  {claimData.refund_status === 'received' ? 'Mottatt' : 
                   claimData.refund_status === 'pending' ? 'Venter' : 
                   claimData.refund_status === 'rejected' ? 'Avvist' : claimData.refund_status}
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center font-semibold border-t pt-2">
              <span>Netto kostnad:</span>
              <span className={netCost > 0 ? 'text-destructive' : 'text-green-600'}>
                {formatCurrency(netCost)}
              </span>
            </div>
          </div>

          {/* Detaljert refusjon */}
          {totalRefunded > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Refunderte poster</h4>
              <div className="space-y-2 text-sm">
                {Number(claimData.refunded_work_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arbeid refundert:</span>
                    <span>{formatCurrency(Number(claimData.refunded_work_cost || 0))}</span>
                  </div>
                )}
                {Number(claimData.refunded_parts_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deler refundert:</span>
                    <span>{formatCurrency(Number(claimData.refunded_parts_cost || 0))}</span>
                  </div>
                )}
                {Number(claimData.refunded_travel_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reise refundert:</span>
                    <span>{formatCurrency(Number(claimData.refunded_travel_cost || 0))}</span>
                  </div>
                )}
                {Number(claimData.refunded_vehicle_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kjøretøy refundert:</span>
                    <span>{formatCurrency(Number(claimData.refunded_vehicle_cost || 0))}</span>
                  </div>
                )}
                {Number(claimData.refunded_other_cost || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annet refundert:</span>
                    <span>{formatCurrency(Number(claimData.refunded_other_cost || 0))}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total refundert:</span>
                  <span>{formatCurrency(totalRefunded)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vedlegg */}
      <ClaimAttachments 
        claimId={id!} 
        claimFiles={claimData.files || []} 
        onFilesUpdate={handleFilesUpdate}
      />

      {/* Kontokode referanse tabell */}
      <Card>
        <CardHeader>
          <CardTitle>Kontokode referanse</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 bg-yellow-50">KONTO</th>
                  <th className="text-left p-2 bg-yellow-50">TYPE</th>
                  <th className="text-left p-2 bg-yellow-50">Eksempel</th>
                </tr>
              </thead>
              <tbody>
                {ACCOUNT_CODES.map((account) => (
                  <tr key={account.code} className="border-b">
                    <td className="p-2 font-medium">{account.code}</td>
                    <td className="p-2">{account.description}</td>
                    <td className="p-2 text-muted-foreground">
                      {account.code};{claimData.product_name || 'Produktnavn'};{claimData.customer_name || 'Kundenavn'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};