import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Eye,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ClaimAttachmentsProps {
  claimId: string;
  claimFiles: any[];
  onFilesUpdate: (files: any[]) => void;
}

export function ClaimAttachments({ claimId, claimFiles, onFilesUpdate }: ClaimAttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'credit_note' | 'invoice' | 'other'>('credit_note');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${claimId}/${Date.now()}_${type}.${fileExt}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('claim-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('claim-attachments')
        .getPublicUrl(fileName);

      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        url: publicUrl,
        type: type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        path: fileName
      };

      // Update claim files in database
      const updatedFiles = [...claimFiles, newFile];
      
      const { error: updateError } = await supabase
        .from('claims')
        .update({ files: updatedFiles })
        .eq('id', claimId);

      if (updateError) throw updateError;

      return updatedFiles;
    },
    onSuccess: (updatedFiles) => {
      onFilesUpdate(updatedFiles);
      setSelectedFile(null);
      setUploading(false);
      toast({
        title: "Vedlegg lastet opp",
        description: "Filen ble lastet opp successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      setUploading(false);
      toast({
        title: "Opplasting feilet",
        description: "Kunne ikke laste opp filen. Prøv igjen.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileToDelete: any) => {
      // Delete from storage
      if (fileToDelete.path) {
        const { error: deleteError } = await supabase.storage
          .from('claim-attachments')
          .remove([fileToDelete.path]);
        
        if (deleteError) {
          console.warn('Could not delete file from storage:', deleteError);
        }
      }

      // Update claim files in database
      const updatedFiles = claimFiles.filter(f => f.id !== fileToDelete.id);
      
      const { error: updateError } = await supabase
        .from('claims')
        .update({ files: updatedFiles })
        .eq('id', claimId);

      if (updateError) throw updateError;

      return updatedFiles;
    },
    onSuccess: (updatedFiles) => {
      onFilesUpdate(updatedFiles);
      toast({
        title: "Vedlegg slettet",
        description: "Filen ble slettet successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Sletting feilet",
        description: "Kunne ikke slette filen. Prøv igjen.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Fil for stor",
          description: "Filen må være mindre enn 10MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    uploadMutation.mutate({ file: selectedFile, type: fileType });
  };

  const handleDownload = (file: any) => {
    window.open(file.url, '_blank');
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-4 w-4" />;
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_note':
        return 'Credit Note';
      case 'invoice':
        return 'Faktura';
      default:
        return 'Annet';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Vedlegg
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <h3 className="text-sm font-medium">Last opp vedlegg</h3>
            <p className="text-xs text-gray-500">Credit notes, fakturaer og andre dokumenter</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label htmlFor="file-type" className="text-sm">Dokumenttype</Label>
              <select
                id="file-type"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded-md text-sm"
              >
                <option value="credit_note">Credit Note</option>
                <option value="invoice">Faktura</option>
                <option value="other">Annet</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="file-upload" className="text-sm">Velg fil</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="mt-1"
              />
            </div>
            
            {selectedFile && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getFileIcon(selectedFile.name)}
                  <span className="text-sm">{selectedFile.name}</span>
                  <Badge variant="outline">{getFileTypeLabel(fileType)}</Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? "Laster opp..." : "Last opp"}
            </Button>
          </div>
        </div>

        {/* Files List */}
        {claimFiles && claimFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Vedlagte filer ({claimFiles.length})</h4>
            <div className="space-y-2">
              {claimFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.name)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getFileTypeLabel(file.type)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        {file.size && formatFileSize(file.size)}
                        {file.uploadedAt && (
                          <>
                            • Lastet opp {new Date(file.uploadedAt).toLocaleDateString('no')}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      title="Last ned"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Forhåndsvis"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{file.name}</DialogTitle>
                        </DialogHeader>
                        <div className="w-full h-96">
                          {file.name.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                              src={file.url}
                              className="w-full h-full border rounded"
                              title={file.name}
                            />
                          ) : (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-contain border rounded"
                            />
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(file)}
                      title="Slett"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!claimFiles || claimFiles.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ingen vedlegg lastet opp enda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}