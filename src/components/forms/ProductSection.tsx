import { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductSectionProps {
  formData: {
    productName: string;
    productNumber?: string;
    productModel: string;
    serialNumber: string;
    purchaseDate: string;
    warrantyPeriod: string;
    supplier: string;
  };
  suppliers: Array<{ name: string }>;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const warrantyOptions = [
  { value: "1year", label: "1 år" },
  { value: "2years", label: "2 år" },
  { value: "3years", label: "3 år" },
  { value: "5years", label: "5 år" }
];

export const ProductSection = memo<ProductSectionProps>(({ 
  formData, 
  suppliers, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Produktinformasjon</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productName">Produktnavn *</Label>
          <Input
            id="productName"
            value={formData.productName}
            onChange={(e) => onFieldChange('productName', e.target.value)}
            disabled={disabled}
            placeholder="Navn på produktet"
          />
        </div>

        {formData.productNumber !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="productNumber">Produktnummer</Label>
            <Input
              id="productNumber"
              value={formData.productNumber}
              onChange={(e) => onFieldChange('productNumber', e.target.value)}
              disabled={disabled}
              placeholder="Produktnummer"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="productModel">Modell</Label>
          <Input
            id="productModel"
            value={formData.productModel}
            onChange={(e) => onFieldChange('productModel', e.target.value)}
            disabled={disabled}
            placeholder="Modellnummer eller navn"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serialNumber">Serienummer</Label>
          <Input
            id="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => onFieldChange('serialNumber', e.target.value)}
            disabled={disabled}
            placeholder="Serienummer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchaseDate">Kjøpsdato</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => onFieldChange('purchaseDate', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="warrantyPeriod">Garantiperiode</Label>
          <Select 
            value={formData.warrantyPeriod} 
            onValueChange={(value) => onFieldChange('warrantyPeriod', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg garantiperiode" />
            </SelectTrigger>
            <SelectContent>
              {warrantyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="supplier">Leverandør *</Label>
          <Select 
            value={formData.supplier} 
            onValueChange={(value) => onFieldChange('supplier', value)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg leverandør" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.name} value={supplier.name}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
});

ProductSection.displayName = 'ProductSection';