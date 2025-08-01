import { memo, useMemo, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

interface Part {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  price: number;
  refundRequested: boolean;
  refundApproved: boolean;
}

interface CustomLineItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface NewEquipmentItem {
  id: string;
  equipmentNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CostSectionProps {
  formData: {
    workHours: number;
    hourlyRate: number;
    overtime50Hours: number;
    overtime100Hours: number;
    travelHours: number;
    travelDistanceKm: number;
    vehicleCostPerKm: number;
    partsCost: number;
    consumablesCost: number;
    externalServicesCost: number;
    travelCost: number;
  };
  parts: Part[];
  customLineItems: CustomLineItem[];
  newEquipmentItems: NewEquipmentItem[];
  onFieldChange: (field: string, value: number) => void;
  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onUpdatePart: (index: number, field: string, value: any) => void;
  onAddCustomLineItem: () => void;
  onRemoveCustomLineItem: (index: number) => void;
  onUpdateCustomLineItem: (index: number, field: string, value: any) => void;
  onAddNewEquipment: () => void;
  onRemoveNewEquipment: (index: number) => void;
  onUpdateNewEquipment: (index: number, field: string, value: any) => void;
  disabled?: boolean;
}

export const CostSection = memo<CostSectionProps>(({
  formData,
  parts,
  customLineItems,
  newEquipmentItems,
  onFieldChange,
  onAddPart,
  onRemovePart,
  onUpdatePart,
  onAddCustomLineItem,
  onRemoveCustomLineItem,
  onUpdateCustomLineItem,
  onAddNewEquipment,
  onRemoveNewEquipment,
  onUpdateNewEquipment,
  disabled = false
}) => {
  // Memoized calculations to prevent unnecessary recalculations
  const calculations = useMemo(() => {
    const workCost = formData.workHours * formData.hourlyRate;
    const overtime50Cost = formData.overtime50Hours * formData.hourlyRate * 1.5;
    const overtime100Cost = formData.overtime100Hours * formData.hourlyRate * 2;
    const travelHoursCost = formData.travelHours * formData.hourlyRate;
    const vehicleCost = formData.travelDistanceKm * formData.vehicleCostPerKm;
    const partsTotal = parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);
    const customLineItemsTotal = customLineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const newEquipmentTotal = newEquipmentItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    
    const totalCost = workCost + overtime50Cost + overtime100Cost + travelHoursCost + 
                     vehicleCost + formData.consumablesCost + formData.externalServicesCost + 
                     formData.travelCost + partsTotal + customLineItemsTotal + newEquipmentTotal;

    return {
      workCost,
      overtime50Cost,
      overtime100Cost,
      travelHoursCost,
      vehicleCost,
      partsTotal,
      customLineItemsTotal,
      newEquipmentTotal,
      totalCost
    };
  }, [
    formData.workHours,
    formData.hourlyRate,
    formData.overtime50Hours,
    formData.overtime100Hours,
    formData.travelHours,
    formData.travelDistanceKm,
    formData.vehicleCostPerKm,
    formData.travelCost,
    formData.partsCost,
    formData.consumablesCost,
    formData.externalServicesCost,
    parts,
    customLineItems,
    newEquipmentItems
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
            <div className="space-y-2">
              <Label htmlFor="overtime50Hours">Overtid 50% (timer)</Label>
              <Input
                id="overtime50Hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.overtime50Hours}
                onChange={(e) => handleNumberChange('overtime50Hours', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overtime100Hours">Overtid 100% (timer)</Label>
              <Input
                id="overtime100Hours"
                type="number"
                min="0"
                step="0.5"
                value={formData.overtime100Hours}
                onChange={(e) => handleNumberChange('overtime100Hours', e.target.value)}
                disabled={disabled}
                placeholder="0"
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Arbeidskostnad: {calculations.workCost.toLocaleString('no-NO')} kr</div>
              <div>Overtid 50%: {calculations.overtime50Cost.toLocaleString('no-NO')} kr</div>
              <div>Overtid 100%: {calculations.overtime100Cost.toLocaleString('no-NO')} kr</div>
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

        {/* Parts section */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Reservedeler
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddPart}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til del
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Ingen reservedeler lagt til ennå
              </p>
            ) : (
              <div className="space-y-3">
                {parts.map((part, index) => (
                  <div key={part.id} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Delenummer</Label>
                      <Input
                        value={part.partNumber}
                        onChange={(e) => onUpdatePart(index, 'partNumber', e.target.value)}
                        disabled={disabled}
                        placeholder="Delenummer"
                      />
                    </div>
                    <div className="flex-2 space-y-2">
                      <Label>Beskrivelse</Label>
                      <Input
                        value={part.description}
                        onChange={(e) => onUpdatePart(index, 'description', e.target.value)}
                        disabled={disabled}
                        placeholder="Beskrivelse av del"
                      />
                    </div>
                     <div className="w-24 space-y-2">
                       <Label>Antall</Label>
                       <Input
                         type="number"
                         min="1"
                         step="1"
                         value={part.quantity.toString()}
                         onChange={(e) => {
                           const value = e.target.value;
                           const numValue = value === '' ? 1 : parseInt(value);
                           if (!isNaN(numValue) && numValue > 0) {
                             onUpdatePart(index, 'quantity', numValue);
                           }
                         }}
                         disabled={disabled}
                         placeholder="1"
                       />
                     </div>
                     <div className="w-32 space-y-2">
                       <Label>Enhetspris (kr)</Label>
                       <Input
                         type="number"
                         min="0"
                         step="0.01"
                         value={part.unitPrice.toString()}
                         onChange={(e) => {
                           const value = e.target.value;
                           const numValue = value === '' ? 0 : parseFloat(value);
                           if (!isNaN(numValue) && numValue >= 0) {
                             onUpdatePart(index, 'unitPrice', numValue);
                           }
                         }}
                         disabled={disabled}
                         placeholder="0"
                       />
                     </div>
                    <div className="w-32 space-y-2">
                      <Label>Totalpris (kr)</Label>
                      <Input
                        type="number"
                        value={part.price}
                        disabled
                        className="bg-muted"
                        placeholder="0"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemovePart(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground text-right">
                  Totalt reservedeler: {calculations.partsTotal.toLocaleString('no-NO')} kr
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Equipment section */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Ny maskin
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddNewEquipment}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til maskin
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newEquipmentItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Ingen ny maskin lagt til ennå
              </p>
            ) : (
              <div className="space-y-3">
                {newEquipmentItems.map((item, index) => (
                  <div key={item.id} className="flex gap-2 items-end">
                    <div className="w-32 space-y-2">
                      <Label>Maskinnummer</Label>
                      <Input
                        value={item.equipmentNumber}
                        onChange={(e) => onUpdateNewEquipment(index, 'equipmentNumber', e.target.value)}
                        disabled={disabled}
                        placeholder="Maskinnr"
                      />
                    </div>
                    <div className="flex-2 space-y-2">
                      <Label>Beskrivelse</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => onUpdateNewEquipment(index, 'description', e.target.value)}
                        disabled={disabled}
                        placeholder="Beskrivelse av maskin"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Antall</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateNewEquipment(index, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={disabled}
                        placeholder="1"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Enhetspris (kr)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateNewEquipment(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveNewEquipment(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground text-right">
                  Totalt ny maskin: {calculations.newEquipmentTotal.toLocaleString('no-NO')} kr
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom line items section */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Tilpassede linjeartikler
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddCustomLineItem}
                disabled={disabled}
              >
                <Plus className="h-4 w-4 mr-2" />
                Legg til artikkel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customLineItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Ingen tilpassede artikler lagt til ennå
              </p>
            ) : (
              <div className="space-y-3">
                {customLineItems.map((item, index) => (
                  <div key={item.id} className="flex gap-2 items-end">
                    <div className="w-32 space-y-2">
                      <Label>Artikkelkode</Label>
                      <Input
                        value={item.partNumber}
                        onChange={(e) => onUpdateCustomLineItem(index, 'partNumber', e.target.value)}
                        disabled={disabled}
                        placeholder="Kode"
                      />
                    </div>
                    <div className="flex-2 space-y-2">
                      <Label>Beskrivelse</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => onUpdateCustomLineItem(index, 'description', e.target.value)}
                        disabled={disabled}
                        placeholder="Beskrivelse av artikkel"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>Antall</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => onUpdateCustomLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={disabled}
                        placeholder="1"
                      />
                    </div>
                    <div className="w-32 space-y-2">
                      <Label>Enhetspris (kr)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => onUpdateCustomLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveCustomLineItem(index)}
                      disabled={disabled}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="text-sm text-muted-foreground text-right">
                  Totalt tilpassede artikler: {calculations.customLineItemsTotal.toLocaleString('no-NO')} kr
                </div>
              </div>
            )}
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
