import React, { useState, useRef } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Upload, X, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EquipmentStepProps {
  form: UseFormReturn<any>;
  onNext: () => void;
}

export const EquipmentStep: React.FC<EquipmentStepProps> = ({ form, onNext }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "equipment"
  });
  
  const [uploadedImages, setUploadedImages] = useState<{ name: string; url: string }[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEquipment = () => {
    append({
      produkt_navn: '',
      modell: '',
      serienummer: '',
      produsent: '',
      kategori: '',
      lokasjon: '',
      installasjon_dato: '',
      service_intervall_måneder: 12,
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          toast({
            title: "Ugyldig filtype",
            description: `${file.name} er ikke et støttet format. Kun bilder og PDF er tillatt.`,
            variant: "destructive"
          });
          continue;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "Fil for stor",
            description: `${file.name} er større enn 10MB.`,
            variant: "destructive"
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `maintenance/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('claim-attachments')
          .upload(filePath, file);

        if (uploadError) {
          toast({
            title: "Feil ved opplasting",
            description: `Kunne ikke laste opp ${file.name}: ${uploadError.message}`,
            variant: "destructive"
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('claim-attachments')
          .getPublicUrl(filePath);

        const newImage = { name: file.name, url: publicUrl };
        setUploadedImages(prev => [...prev, newImage]);
        
        // Update form with image URLs
        const currentImages = form.getValues('bilder') || [];
        form.setValue('bilder', [...currentImages, publicUrl]);

        toast({
          title: "Fil lastet opp",
          description: `${file.name} er nå tilgjengelig`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Feil ved opplasting",
        description: "En uventet feil oppstod",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileRemoved = async (fileName: string) => {
    const imageToRemove = uploadedImages.find(img => img.name === fileName);
    if (!imageToRemove) return;

    try {
      // Extract file path from URL
      const url = new URL(imageToRemove.url);
      const filePath = url.pathname.split('/').slice(-2).join('/');
      
      await supabase.storage
        .from('claim-attachments')
        .remove([filePath]);

      setUploadedImages(prev => prev.filter(img => img.name !== fileName));
      
      // Update form
      const currentImages = form.getValues('bilder') || [];
      const updatedImages = currentImages.filter(url => url !== imageToRemove.url);
      form.setValue('bilder', updatedImages);

      toast({
        title: "Bilde fjernet",
        description: `${fileName} er fjernet`,
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: "Feil ved sletting",
        description: `Kunne ikke fjerne ${fileName}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Utstyr og maskiner</CardTitle>
          <CardDescription>
            Registrer alt utstyr som skal inkluderes i vedlikeholdsavtalen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Utstyr #{index + 1}</CardTitle>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.produkt_navn`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produktnavn *</FormLabel>
                          <FormControl>
                            <Input placeholder="F.eks. Kjøleskap, Fryser..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.modell`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modell</FormLabel>
                          <FormControl>
                            <Input placeholder="Modellnummer eller navn" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.serienummer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Serienummer</FormLabel>
                          <FormControl>
                            <Input placeholder="Unikt serienummer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.produsent`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produsent</FormLabel>
                          <FormControl>
                            <Input placeholder="Merke/produsent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`equipment.${index}.kategori`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <FormControl>
                            <Input placeholder="F.eks. Kjøl, Frys, Oppvaskmaskin..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.lokasjon`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasjon</FormLabel>
                          <FormControl>
                            <Input placeholder="Rom, avdeling etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`equipment.${index}.service_intervall_måneder`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service-intervall (måneder)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="60"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 12)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`equipment.${index}.installasjon_dato`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installasjonsdato</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addEquipment}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til utstyr
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Bilder og dokumentasjon
            {uploadedImages.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageGallery(!showImageGallery)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showImageGallery ? 'Skjul' : 'Vis'} galleri ({uploadedImages.length})
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Last opp bilder av utstyr, installasjoner eller relevante dokumenter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors hover:border-muted-foreground/50">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Last opp bilder og dokumenter
              </p>
              <p className="text-sm text-muted-foreground">
                Klikk for å velge filer (bilder eller PDF)
              </p>
              <p className="text-xs text-muted-foreground">
                Maks 10MB per fil
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="mt-4"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Laster opp...' : 'Velg filer'}
            </Button>
          </div>
          
          {showImageGallery && uploadedImages.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Opplastede bilder:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNmMtMi4yIDAtNCAxLjgtNCA0czEuOCA0IDQgNCA0LTEuOCA0LTQtMS44LTQtNC00eiIgZmlsbD0iIzljYTNhZiIvPgo8L3N2Zz4K';
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleFileRemoved(image.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          Neste: Planlegg besøk
        </Button>
      </div>
    </div>
  );
};