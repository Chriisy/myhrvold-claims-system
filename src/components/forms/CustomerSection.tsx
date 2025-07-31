import { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerAutocomplete } from "@/components/ui/customer-autocomplete";

interface CustomerSectionProps {
  formData: {
    customerName: string;
    customerNumber: string;
    customerContact: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
  };
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

export const CustomerSection = memo<CustomerSectionProps>(({ 
  formData, 
  onFieldChange, 
  disabled = false 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Kundeinformasjon</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Kundenavn *</Label>
          <CustomerAutocomplete
            value={formData.customerName}
            onChange={(value) => onFieldChange('customerName', value)}
            onCustomerSelect={(customer) => {
              onFieldChange('customerName', customer.customer_name);
              onFieldChange('customerNumber', customer.customer_number);
              onFieldChange('customerContact', customer.contact_person || '');
              onFieldChange('customerEmail', customer.email || '');
              onFieldChange('customerPhone', customer.phone || '');
              onFieldChange('customerAddress', customer.address || '');
            }}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerNumber">Kundenummer *</Label>
          <Input
            id="customerNumber"
            value={formData.customerNumber}
            onChange={(e) => onFieldChange('customerNumber', e.target.value)}
            disabled={disabled}
            placeholder="Kundenummer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerContact">Kontaktperson</Label>
          <Input
            id="customerContact"
            value={formData.customerContact}
            onChange={(e) => onFieldChange('customerContact', e.target.value)}
            disabled={disabled}
            placeholder="Navn på kontaktperson"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">E-post</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => onFieldChange('customerEmail', e.target.value)}
            disabled={disabled}
            placeholder="kunde@firma.no"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Telefon</Label>
          <Input
            id="customerPhone"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => onFieldChange('customerPhone', e.target.value)}
            disabled={disabled}
            placeholder="+47 xxx xx xxx"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="customerAddress">Adresse</Label>
          <Textarea
            id="customerAddress"
            value={formData.customerAddress}
            onChange={(e) => onFieldChange('customerAddress', e.target.value)}
            disabled={disabled}
            placeholder="Fullstendig adresse"
            rows={2}
          />
        </div>
      </div>
    </div>
  );
});

CustomerSection.displayName = 'CustomerSection';