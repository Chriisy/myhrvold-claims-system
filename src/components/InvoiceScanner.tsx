import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle } from 'lucide-react';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { OCRService } from '@/services/ocrService';
import { ScannedInvoiceData, InvoiceScannerProps } from '@/types/scanner';
import { ScannerUpload } from '@/components/scanner/ScannerUpload';
import { ScannerResults } from '@/components/scanner/ScannerResults';
import { OCRMethodSelector } from '@/components/scanner/OCRMethodSelector';

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
  const [showMethodSelector, setShowMethodSelector] = useState(true);

  const handleFileUpload = async (file: File, useOpenAI: boolean = false) => {
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      showError('Ugyldig filtype', 'Kun JPG og PNG er støttet');
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

      // Process with OCR service
      const parsedData = await OCRService.processImage(file, undefined, useOpenAI);
      console.log('OCR result:', parsedData);

      if (parsedData) {
        setExtractedData(parsedData);
        validateExtractedData(parsedData);
      } else {
        throw new Error('No data extracted from invoice');
      }
      showSuccess(
        'Faktura skannet!',
        `${Math.round((parsedData.confidence || 0) * 100)}% sikkerhet på gjenkjenning ${useOpenAI ? '(OpenAI)' : '(Tesseract)'}`
      );

    } catch (error: any) {
      console.error('OCR Error:', error);
      
      // If OpenAI fails, try Tesseract as fallback
      if (useOpenAI) {
        showError('OpenAI feilet', 'Prøver Tesseract som backup...');
        return handleFileUpload(file, false);
      }
      
      showError(
        'Skanning feilet',
        error.message || 'Kunne ikke lese fakturaen. Prøv med et klarere bilde.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenAIUpload = (file: File) => handleFileUpload(file, true);
  const handleTesseractUpload = (file: File) => handleFileUpload(file, false);

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
    setShowMethodSelector(true);
    onOpenChange(false);
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
          {/* Method Selection */}
          {!extractedData && showMethodSelector && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Velg OCR-metode</h3>
              <OCRMethodSelector
                onMethodSelect={(useOpenAI) => {
                  setShowMethodSelector(false);
                  // Create file input element programmatically
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleFileUpload(file, useOpenAI);
                    }
                  };
                  input.click();
                }}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Upload Section */}
          {!extractedData && !showMethodSelector && (
            <ScannerUpload 
              isProcessing={isProcessing}
              onFileUpload={handleTesseractUpload}
            />
          )}

          {/* Results Section */}
          {extractedData && (
            <ScannerResults
              extractedData={extractedData}
              previewImage={previewImage}
              validationErrors={validationErrors}
            />
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
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceScanner;