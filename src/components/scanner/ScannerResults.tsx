import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ScannedInvoiceData } from '@/types/scanner';

interface ScannerResultsProps {
  extractedData: ScannedInvoiceData;
  previewImage: string | null;
  validationErrors: string[];
}

export const ScannerResults: React.FC<ScannerResultsProps> = ({
  extractedData,
  previewImage,
  validationErrors
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Preview */}
      <div className="space-y-4">
        <h3 className="font-medium">Skannet faktura</h3>
        {previewImage && (
          <div className="border rounded-lg overflow-hidden">
            <img
              src={previewImage}
              alt="Faktura forhåndsvisning"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        )}
        <div className={`p-3 rounded-lg ${
          extractedData.confidence >= 90 ? 'bg-green-50 dark:bg-green-950' :
          extractedData.confidence >= 70 ? 'bg-yellow-50 dark:bg-yellow-950' :
          'bg-red-50 dark:bg-red-950'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle className={`h-4 w-4 ${
              extractedData.confidence >= 90 ? 'text-green-600' :
              extractedData.confidence >= 70 ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            <span className="text-sm font-medium">
              Sikkerhet: {Math.round(extractedData.confidence)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {extractedData.confidence >= 90 ? 'Høy sikkerhet - data ser bra ut' : 
             extractedData.confidence >= 70 ? 'Middels sikkerhet' : 
             'Lav sikkerhet - sjekk felter nøye'}
          </div>
        </div>
      </div>

      {/* Extracted Data */}
      <div className="space-y-4">
        <h3 className="font-medium">Gjenkjente felter</h3>
        
        {validationErrors.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs">Fakturanummer</Label>
            <Input 
              value={extractedData.invoiceNumber || 'Ikke funnet'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs">Kundenavn</Label>
            <Input 
              value={extractedData.customerName || 'Ikke funnet'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs">Org.nummer</Label>
            <Input 
              value={extractedData.customerOrgNumber || 'Ikke funnet'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div>
            <Label className="text-xs">Produktnavn</Label>
            <Input 
              value={extractedData.productName || 'Ikke funnet'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Arbeidskostnad</Label>
              <Input 
                value={extractedData.laborCost ? `${extractedData.laborCost.toLocaleString('no-NO')} kr` : 'Ikke funnet'} 
                readOnly 
                className="bg-muted"
              />
            </div>
            <div>
              <Label className="text-xs">Delekostnad</Label>
              <Input 
                value={extractedData.partsCost ? `${extractedData.partsCost.toLocaleString('no-NO')} kr` : 'Ikke funnet'} 
                readOnly 
                className="bg-muted"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Totalbeløp</Label>
            <Input 
              value={extractedData.totalAmount ? `${extractedData.totalAmount.toLocaleString('no-NO')} kr` : 'Ikke funnet'} 
              readOnly 
              className="bg-muted"
            />
          </div>
          {extractedData.evaticJobNumber && (
            <div>
              <Label className="text-xs">Jobbnummer</Label>
              <Input 
                value={extractedData.evaticJobNumber} 
                readOnly 
                className="bg-muted"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};