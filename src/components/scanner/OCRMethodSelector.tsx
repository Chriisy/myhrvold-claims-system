import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface OCRMethodSelectorProps {
  onMethodSelect: (useOpenAI: boolean) => void;
  isProcessing: boolean;
}

export const OCRMethodSelector: React.FC<OCRMethodSelectorProps> = ({
  onMethodSelect,
  isProcessing
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* OpenAI Vision */}
      <Card className="relative border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            OpenAI Vision
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">ANBEFALT</span>
          </CardTitle>
          <CardDescription>
            AI-drevet OCR med høy presisjon for norske fakturaer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>95%+ nøyaktighet</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Forstår struktur og kontekst</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Direkte JSON-output</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>~$0.008 per bilde</span>
            </div>
          </div>
          <Button 
            onClick={() => onMethodSelect(true)}
            disabled={isProcessing}
            className="w-full"
          >
            <Brain className="mr-2 h-4 w-4" />
            Bruk OpenAI Vision
          </Button>
        </CardContent>
      </Card>

      {/* Tesseract */}
      <Card className="relative border-2 hover:border-primary/50 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            Tesseract OCR
            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">GRATIS</span>
          </CardTitle>
          <CardDescription>
            Lokal OCR-processing uten kostnader
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Gratis å bruke</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Offline-kapabel</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>60-80% nøyaktighet</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Krever manuell kontroll</span>
            </div>
          </div>
          <Button 
            onClick={() => onMethodSelect(false)}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            Bruk Tesseract OCR
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};