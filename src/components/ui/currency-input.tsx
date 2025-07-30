import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { currencyService, Currency } from "@/services/currencyService";
import { cn } from "@/lib/utils";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  value?: number;
  onChange?: (value: number, currency: Currency) => void;
  currency?: Currency;
  onCurrencyChange?: (currency: Currency) => void;
  showConversion?: boolean;
  className?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    label, 
    value = 0, 
    onChange, 
    currency = 'NOK', 
    onCurrencyChange,
    showConversion = true,
    className,
    ...props 
  }, ref) => {
    const supportedCurrencies = currencyService.getSupportedCurrencies();
    const nokEquivalent = currencyService.convert(value, currency, 'NOK');
    
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseFloat(e.target.value) || 0;
      onChange?.(numValue, currency);
    };

    const handleCurrencyChange = (newCurrency: Currency) => {
      onCurrencyChange?.(newCurrency);
      // Convert the current value to the new currency
      const convertedValue = currencyService.convert(value, currency, newCurrency);
      onChange?.(convertedValue, newCurrency);
    };

    return (
      <div className={cn("space-y-2", className)}>
        {label && <Label>{label}</Label>}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={ref}
              type="number"
              step="0.01"
              min="0"
              value={value || ''}
              onChange={handleValueChange}
              {...props}
            />
          </div>
          <Select value={currency} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedCurrencies.map((curr) => (
                <SelectItem key={curr.value} value={curr.value}>
                  {curr.symbol} {curr.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {showConversion && currency === 'EUR' && (
          <div className="text-xs text-muted-foreground">
            = {currencyService.format(nokEquivalent, 'NOK')} 
            <span className="ml-1">(kurs: {currencyService.getExchangeRate('EUR', 'NOK').toFixed(2)})</span>
          </div>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";