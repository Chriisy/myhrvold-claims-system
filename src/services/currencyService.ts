// Currency conversion service
export interface CurrencyRates {
  EUR: number;
  NOK: number;
}

export type Currency = 'NOK' | 'EUR';

// Default exchange rate (should be updated from API in production)
const DEFAULT_EUR_TO_NOK_RATE = 11.50; // Approximate rate

// In a real app, this would fetch from an API like ECB or similar
let cachedRates: CurrencyRates = {
  EUR: 1,
  NOK: DEFAULT_EUR_TO_NOK_RATE
};

export const currencyService = {
  // Convert from source currency to target currency
  convert: (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    
    if (fromCurrency === 'EUR' && toCurrency === 'NOK') {
      return amount * cachedRates.NOK;
    }
    
    if (fromCurrency === 'NOK' && toCurrency === 'EUR') {
      return amount / cachedRates.NOK;
    }
    
    return amount;
  },

  // Format currency with proper symbol and locale
  format: (amount: number, currency: Currency = 'NOK', showCurrency: boolean = true): string => {
    if (!amount && amount !== 0) return showCurrency ? "0 kr" : "0";
    
    if (currency === 'EUR') {
      return new Intl.NumberFormat('no-NO', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    }
    
    // Default to NOK
    return new Intl.NumberFormat('no-NO', {
      style: showCurrency ? 'currency' : 'decimal',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format currency for display (always shows NOK equivalent)
  formatWithConversion: (amount: number, inputCurrency: Currency = 'NOK'): string => {
    const nokAmount = currencyService.convert(amount, inputCurrency, 'NOK');
    return currencyService.format(nokAmount, 'NOK');
  },

  // Get current exchange rate
  getExchangeRate: (fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return 1;
    
    if (fromCurrency === 'EUR' && toCurrency === 'NOK') {
      return cachedRates.NOK;
    }
    
    if (fromCurrency === 'NOK' && toCurrency === 'EUR') {
      return 1 / cachedRates.NOK;
    }
    
    return 1;
  },

  // Update exchange rates (for future API integration)
  updateRates: (newRates: Partial<CurrencyRates>) => {
    cachedRates = { ...cachedRates, ...newRates };
  },

  // Get supported currencies
  getSupportedCurrencies: (): Array<{ value: Currency; label: string; symbol: string }> => [
    { value: 'NOK', label: 'Norske kroner', symbol: 'kr' },
    { value: 'EUR', label: 'Euro', symbol: '€' }
  ]
};