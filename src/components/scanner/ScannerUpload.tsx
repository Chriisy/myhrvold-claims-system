import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2 } from 'lucide-react';

interface ScannerUploadProps {
  isProcessing: boolean;
  onFileUpload: (file: File) => Promise<void>;
}

export const ScannerUpload: React.FC<ScannerUploadProps> = ({
  isProcessing,
  onFileUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
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

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};