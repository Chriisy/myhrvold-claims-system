import { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormGrid, FormSection } from "@/components/ui/form-components";

interface RefundSectionProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  disabled?: boolean;
}

export const RefundSection = memo<RefundSectionProps>(({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-6">
      <FormSection title="Refusjonsinformasjon" description="Kredittnotas og refusjonsdetaljer">
        <FormGrid columns={2}>
          <FormField 
            label="Kreditnota nummer" 
            help="Nummeret på kredittnotaen fra leverandør"
          >
            <Input
              value={formData.creditNoteNumber}
              onChange={(e) => onFieldChange('creditNoteNumber', e.target.value)}
              disabled={disabled}
              placeholder="Kredittnotas nummer"
            />
          </FormField>

          <FormField 
            label="Refusjonsdato mottatt" 
            help="Datoen da refusjonen ble mottatt"
          >
            <Input
              type="date"
              value={formData.refundDateReceived}
              onChange={(e) => onFieldChange('refundDateReceived', e.target.value)}
              disabled={disabled}
            />
          </FormField>

          <FormField 
            label="Forventet refusjon (kr)" 
            help="Beløpet du forventer å få refundert"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.expectedRefund}
              onChange={(e) => onFieldChange('expectedRefund', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <FormField 
            label="Faktisk refusjon (kr)" 
            help="Det faktiske beløpet som ble refundert"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.actualRefund}
              onChange={(e) => onFieldChange('actualRefund', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField 
              label="Refusjonsstatus" 
              help="Status for refusjonsprosessen"
            >
              <Select 
                value={formData.refundStatus} 
                onValueChange={(value) => onFieldChange('refundStatus', value)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Velg refusjonsstatus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Venter</SelectItem>
                  <SelectItem value="partial">Delvis refundert</SelectItem>
                  <SelectItem value="completed">Fullført</SelectItem>
                  <SelectItem value="rejected">Avvist</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormGrid>
      </FormSection>

      <FormSection title="Refunderte kostnader" description="Detaljert oversikt over refunderte beløp">
        <FormGrid columns={2}>
          <FormField 
            label="Refundert arbeidskostnad (kr)"
            help="Refundert beløp for arbeidstimer"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.refundedWorkCost}
              onChange={(e) => onFieldChange('refundedWorkCost', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <FormField 
            label="Refundert reisekostnad (kr)"
            help="Refundert beløp for reisetid"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.refundedTravelCost}
              onChange={(e) => onFieldChange('refundedTravelCost', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <FormField 
            label="Refundert kjøretøykostnad (kr)"
            help="Refundert beløp for kjøretøy/transport"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.refundedVehicleCost}
              onChange={(e) => onFieldChange('refundedVehicleCost', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <FormField 
            label="Refundert reservedelskostnad (kr)"
            help="Refundert beløp for reservedeler"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.refundedPartsCost}
              onChange={(e) => onFieldChange('refundedPartsCost', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>

          <FormField 
            label="Refundert andre kostnader (kr)"
            help="Andre refunderte kostnader"
          >
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.refundedOtherCost}
              onChange={(e) => onFieldChange('refundedOtherCost', parseFloat(e.target.value) || 0)}
              disabled={disabled}
              placeholder="0"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Refusjonsoversikt</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Forventet:</span>
            <div className="font-medium">{formData.expectedRefund.toLocaleString('no-NO')} kr</div>
          </div>
          <div>
            <span className="text-muted-foreground">Faktisk:</span>
            <div className="font-medium">{formData.actualRefund.toLocaleString('no-NO')} kr</div>
          </div>
          <div>
            <span className="text-muted-foreground">Netto kostnad:</span>
            <div className="font-medium">
              {((formData.totalCost || 0) - (formData.actualRefund || 0)).toLocaleString('no-NO')} kr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

RefundSection.displayName = 'RefundSection';