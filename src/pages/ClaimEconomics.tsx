import { useParams } from 'react-router-dom';
import { useClaim } from '@/hooks/useClaim';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, Edit, Save, X } from "lucide-react";
import { useState } from 'react';
import { useUpdateClaimStatus } from '@/hooks/useClaimMutations';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { supabase } from '@/integrations/supabase/client';

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

  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount) return "0 kr";
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const workCost = (claim.work_hours || 0) * (claim.hourly_rate || 0);
  const totalCost = workCost + (claim.parts_cost || 0) + (claim.travel_cost || 0) + 
                   (claim.consumables_cost || 0) + (claim.external_services_cost || 0);
  const totalRefunded = (claim.refunded_work_cost || 0) + (claim.refunded_parts_cost || 0) + 
                       (claim.refunded_travel_cost || 0) + (claim.refunded_vehicle_cost || 0) + 
                       (claim.refunded_other_cost || 0);
  const netCost = totalCost - totalRefunded;

  return (
    <div className="space-y-6">
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
          <CardTitle>Kostnadsoversikt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Arbeid ({claim.work_hours}t):</span>
                <span className="font-medium">{formatCurrency(workCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deler:</span>
                <span className="font-medium">{formatCurrency(claim.parts_cost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reise:</span>
                <span className="font-medium">{formatCurrency(claim.travel_cost)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Forbruksmateriell:</span>
                <span className="font-medium">{formatCurrency(claim.consumables_cost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ekstern service:</span>
                <span className="font-medium">{formatCurrency(claim.external_services_cost)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total kostnad:</span>
                <span>{formatCurrency(totalCost)}</span>
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
              <span className="font-medium">{formatCurrency(claim.expected_refund)}</span>
            </div>
            
            {claim.actual_refund !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Faktisk refusjon:</span>
                <span className="font-medium">{formatCurrency(claim.actual_refund)}</span>
              </div>
            )}

            {claim.refund_status && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={
                  claim.refund_status === 'received' ? 'default' : 
                  claim.refund_status === 'pending' ? 'secondary' : 
                  'destructive'
                }>
                  {claim.refund_status === 'received' ? 'Mottatt' : 
                   claim.refund_status === 'pending' ? 'Venter' : 
                   claim.refund_status === 'rejected' ? 'Avvist' : claim.refund_status}
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
                {claim.refunded_work_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arbeid refundert:</span>
                    <span>{formatCurrency(claim.refunded_work_cost)}</span>
                  </div>
                )}
                {claim.refunded_parts_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deler refundert:</span>
                    <span>{formatCurrency(claim.refunded_parts_cost)}</span>
                  </div>
                )}
                {claim.refunded_travel_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reise refundert:</span>
                    <span>{formatCurrency(claim.refunded_travel_cost)}</span>
                  </div>
                )}
                {claim.refunded_vehicle_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kjøretøy refundert:</span>
                    <span>{formatCurrency(claim.refunded_vehicle_cost)}</span>
                  </div>
                )}
                {claim.refunded_other_cost && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annet refundert:</span>
                    <span>{formatCurrency(claim.refunded_other_cost)}</span>
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
                      {account.code};{claim.product_name || 'Produktnavn'};{claim.customer_name || 'Kundenavn'}
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