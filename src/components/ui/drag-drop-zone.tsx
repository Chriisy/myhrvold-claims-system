import React, { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DragDropZoneProps {
  onFilesAdded: (files: File[]) => void;
  files: File[];
  onFileRemove: (index: number) => void;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  onFilesAdded,
  files,
  onFileRemove,
  accept = "*/*",
  maxSize = 10,
  maxFiles = 10,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      const sizeValid = file.size <= maxSize * 1024 * 1024;
      return sizeValid;
    });

    if (files.length + validFiles.length <= maxFiles) {
      onFilesAdded(validFiles);
    }
  }, [files.length, maxFiles, maxSize, onFilesAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const sizeValid = file.size <= maxSize * 1024 * 1024;
      return sizeValid;
    });

    if (files.length + validFiles.length <= maxFiles) {
      onFilesAdded(validFiles);
    }
    
    // Reset input
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            Dra og slipp filer her
          </p>
          <p className="text-sm text-muted-foreground">
            eller klikk for å velge filer
          </p>
          <p className="text-xs text-muted-foreground">
            Maks {maxSize}MB per fil, {maxFiles} filer totalt
          </p>
        </div>
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <Button 
          type="button" 
          variant="outline" 
          className="mt-4"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Velg filer
        </Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Opplastede filer ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onFileRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};