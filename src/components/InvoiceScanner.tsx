import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { createWorker } from 'tesseract.js';

interface ScannedInvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerOrgNumber: string;
  productName: string;
  productModel: string;
  laborCost: number;
  partsCost: number;
  totalAmount: number;
  evaticJobNumber?: string;
  invoiceDate: string;
  confidence: number;
}

interface InvoiceScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataExtracted: (data: ScannedInvoiceData) => void;
}

const InvoiceScanner: React.FC<InvoiceScannerProps> = ({
  open,
  onOpenChange,
  onDataExtracted
}) => {
  const { showSuccess, showError } = useEnhancedToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ScannedInvoiceData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const parseVismaInvoice = (text: string): ScannedInvoiceData => {
    const vismaPatterns = {
      invoiceNumber: /Fakturanummer[:\s]*(\d+)/i,
      customerName: /(?:Kunde|Customer)[:\s]*([^\n\r]{2,50})/i,
      customerOrgNumber: /(?:Org\.?\s*nr\.?|Orgnr)[:\s]*(\d{9})/i,
      productName: /(?:Produktnavn|Product)[:\s]*([^\n\r]{2,50})/i,
      productModel: /(?:Modell|Model)[:\s]*([^\n\r]{2,30})/i,
      laborCost: /(?:Arbeid|Labor)[:\s]*kr[:\s]*(\d+(?:\.\d{2})?)/i,
      partsCost: /(?:Deler|Parts)[:\s]*kr[:\s]*(\d+(?:\.\d{2})?)/i,
      totalAmount: /(?:Total|Sum)[:\s]*kr[:\s]*(\d+(?:\.\d{2})?)/i,
      evaticJobNumber: /(?:Evatic|Job)[:\s]*(\d+)/i,
      invoiceDate: /(?:Dato|Date)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    };

    const extractValue = (pattern: RegExp, defaultValue: any = '') => {
      const match = text.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    const parseAmount = (amountStr: string): number => {
      if (!amountStr) return 0;
      const cleaned = amountStr.replace(/[^\d,\.]/g, '');
      return parseFloat(cleaned.replace(',', '.')) || 0;
    };

    const data: ScannedInvoiceData = {
      invoiceNumber: extractValue(vismaPatterns.invoiceNumber),
      customerName: extractValue(vismaPatterns.customerName),
      customerOrgNumber: extractValue(vismaPatterns.customerOrgNumber),
      productName: extractValue(vismaPatterns.productName),
      productModel: extractValue(vismaPatterns.productModel),
      laborCost: parseAmount(extractValue(vismaPatterns.laborCost, '0')),
      partsCost: parseAmount(extractValue(vismaPatterns.partsCost, '0')),
      totalAmount: parseAmount(extractValue(vismaPatterns.totalAmount, '0')),
      evaticJobNumber: extractValue(vismaPatterns.evaticJobNumber),
      invoiceDate: extractValue(vismaPatterns.invoiceDate),
      confidence: 0
    };

    // Calculate confidence score
    let confidence = 0;
    let totalFields = 0;

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'confidence') return;
      totalFields++;
      if (value && value !== '') {
        confidence++;
      }
    });

    data.confidence = totalFields > 0 ? confidence / totalFields : 0;
    return data;
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      showError('Ugyldig filtype', 'Kun JPG og PNG er støttet med Tesseract.js');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('For stor fil', 'Maksimal filstørrelse er 10MB');
      return;
    }

    setIsProcessing(true);
    setValidationErrors([]);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Process with Tesseract.js
      const worker = await createWorker('nor', 1, {
        logger: m => console.log(m) // Logging for debugging
      });

      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      console.log('OCR Text:', text);

      // Parse the extracted text
      const parsedData = parseVismaInvoice(text);
      
      setExtractedData(parsedData);
      validateExtractedData(parsedData);
      showSuccess(
        'Faktura skannet!',
        `${Math.round(parsedData.confidence * 100)}% sikkerhet på gjenkjenning`
      );

    } catch (error: any) {
      console.error('OCR Error:', error);
      showError(
        'Skanning feilet',
        error.message || 'Kunne ikke lese fakturaen. Prøv med et klarere bilde.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const validateExtractedData = (data: ScannedInvoiceData) => {
    const errors: string[] = [];

    if (!data.invoiceNumber) {
      errors.push('Fakturanummer ikke funnet');
    }
    
    if (!data.customerName) {
      errors.push('Kundenavn ikke funnet');
    }

    if (data.totalAmount === 0) {
      errors.push('Totalbeløp ikke funnet');
    }

    if (data.confidence < 0.5) {
      errors.push('Lav sikkerhet på gjenkjenning - vennligst kontroller alle felter');
    }

    setValidationErrors(errors);
  };

  const handleAcceptData = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      handleClose();
      showSuccess('Data overført', 'Faktura-data er lagt til i skjemaet');
    }
  };

  const handleClose = () => {
    setExtractedData(null);
    setPreviewImage(null);
    setValidationErrors([]);
    setIsProcessing(false);
    onOpenChange(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Skann Visma-faktura
          </DialogTitle>
          <DialogDescription>
            Last opp eller ta bilde av fakturaen for automatisk utfylling av skjemaet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          {!extractedData && (
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={triggerFileInput}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Last opp fil
                </Button>
                <Button
                  variant="outline"
                  onClick={triggerCameraInput}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Ta bilde
                </Button>
              </div>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Dra og slipp faktura her, eller bruk knappene over
                </p>
                <p className="text-xs text-muted-foreground">
                  Støtter JPG og PNG • Maks 10MB
                </p>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mr-3" />
                  <div className="text-center">
                    <p className="font-medium">Prosesserer faktura...</p>
                    <p className="text-sm text-muted-foreground">Dette kan ta noen sekunder</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {extractedData && (
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
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">
                    Sikkerhet: {Math.round(extractedData.confidence * 100)}%
                  </span>
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
                        value={extractedData.laborCost > 0 ? `${extractedData.laborCost} kr` : 'Ikke funnet'} 
                        readOnly 
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Delerkostnad</Label>
                      <Input 
                        value={extractedData.partsCost > 0 ? `${extractedData.partsCost} kr` : 'Ikke funnet'} 
                        readOnly 
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Totalbeløp</Label>
                    <Input 
                      value={extractedData.totalAmount > 0 ? `${extractedData.totalAmount} kr` : 'Ikke funnet'} 
                      readOnly 
                      className="bg-muted font-medium"
                    />
                  </div>
                  {extractedData.evaticJobNumber && (
                    <div>
                      <Label className="text-xs">Evatic jobbnummer</Label>
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Avbryt
          </Button>
          {extractedData && (
            <Button onClick={handleAcceptData}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Bruk disse verdiene
            </Button>
          )}
        </DialogFooter>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceScanner;