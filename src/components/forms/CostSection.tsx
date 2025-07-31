import { memo, useMemo, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CostSectionProps {
  formData: {
    workHours: number;
    hourlyRate: number;
    travelHours: number;
    travelDistanceKm: number;
    vehicleCostPerKm: number;
    partsCost: number;
    consumablesCost: number;
    externalServicesCost: number;
    travelCost: number;
  };
  onFieldChange: (field: string, value: number) => void;
  disabled?: boolean;
}

export const CostSection = memo<CostSectionProps>(({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  // Memoized calculations to prevent unnecessary recalculations
  const calculations = useMemo(() => {
    const workCost = formData.workHours * formData.hourlyRate;
    const vehicleCost = formData.travelDistanceKm * formData.vehicleCostPerKm;
    const totalCost = workCost + formData.travelCost + vehicleCost + formData.partsCost + 
                     formData.consumablesCost + formData.externalServicesCost;

    return {
      workCost,
      vehicleCost,
      totalCost
    };
  }, [
    formData.workHours,
    formData.hourlyRate,
    formData.travelDistanceKm,
    formData.vehicleCostPerKm,
    formData.travelCost,
    formData.partsCost,
    formData.consumablesCost,
    formData.externalServicesCost
  ]);

  // Memoized number input handler
  const handleNumberChange = useCallback((field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    onFieldChange(field, numValue);
  }, [onFieldChange]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Kostnadsberegning</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Work costs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Arbeidskostnader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="workHours">Arbeidstimer</Label>
              <Input
                id="workHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.workHours}
                onChange={(e) => handleNumberChange('workHours', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Timelønn (kr)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="1"
                value={formData.hourlyRate}
                onChange={(e) => handleNumberChange('hourlyRate', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Arbeidskostnad: {calculations.workCost.toLocaleString('no-NO')} kr
            </div>
          </CardContent>
        </Card>

        {/* Travel costs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reisekostnader</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="travelHours">Reisetimer</Label>
              <Input
                id="travelHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.travelHours}
                onChange={(e) => handleNumberChange('travelHours', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelDistanceKm">Reiseavstand (km)</Label>
              <Input
                id="travelDistanceKm"
                type="number"
                min="0"
                step="1"
                value={formData.travelDistanceKm}
                onChange={(e) => handleNumberChange('travelDistanceKm', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleCostPerKm">Kjøregodtgjørelse (kr/km)</Label>
              <Input
                id="vehicleCostPerKm"
                type="number"
                min="0"
                step="0.1"
                value={formData.vehicleCostPerKm}
                onChange={(e) => handleNumberChange('vehicleCostPerKm', e.target.value)}
                disabled={disabled}
                placeholder="7.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="travelCost">Andre reisekostnader (kr)</Label>
              <Input
                id="travelCost"
                type="number"
                min="0"
                step="1"
                value={formData.travelCost}
                onChange={(e) => handleNumberChange('travelCost', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Kjøregodtgjørelse: {calculations.vehicleCost.toLocaleString('no-NO')} kr
            </div>
          </CardContent>
        </Card>

        {/* Other costs */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Andre kostnader</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partsCost">Delkostnader (kr)</Label>
                <Input
                  id="partsCost"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.partsCost}
                  onChange={(e) => handleNumberChange('partsCost', e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="consumablesCost">Forbruksmateriell (kr)</Label>
                <Input
                  id="consumablesCost"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.consumablesCost}
                  onChange={(e) => handleNumberChange('consumablesCost', e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalServicesCost">Eksterne tjenester (kr)</Label>
                <Input
                  id="externalServicesCost"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.externalServicesCost}
                  onChange={(e) => handleNumberChange('externalServicesCost', e.target.value)}
                  disabled={disabled}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total cost summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total kostnad:</span>
            <span>{calculations.totalCost.toLocaleString('no-NO')} kr</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

CostSection.displayName = 'CostSection';
