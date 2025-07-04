import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-components';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { ButtonLoading } from '@/components/ui/loading';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import { validateSupplierEmail, SupplierEmailFormData } from '@/schemas/validationSchemas';

interface SendSupplierEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  supplierName: string;
  defaultEmail?: string;
}

const SendSupplierEmailDialog: React.FC<SendSupplierEmailDialogProps> = ({
  open,
  onOpenChange,
  claimId,
  supplierName,
  defaultEmail = ''
}) => {
  const { showSuccess, showError } = useEnhancedToast();
  const [formData, setFormData] = useState<SupplierEmailFormData>({
    supplierEmail: defaultEmail,
    language: 'no'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSupplierEmail(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await supabase.functions.invoke('send-supplier-email', {
        body: {
          claimId,
          language: formData.language,
          supplierEmail: formData.supplierEmail.trim()
        }
      });

      if (error) throw error;

      showSuccess(
        "E-post sendt",
        `E-post ble sendt til ${supplierName} (${formData.supplierEmail})`
      );

      onOpenChange(false);
      setFormData({ supplierEmail: '', language: 'no' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      showError(
        "Feil ved sending",
        error.message || "Kunne ikke sende e-post til leverandør"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setFormData({ supplierEmail: defaultEmail, language: 'no' });
      setErrors({});
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send e-post til leverandør
          </DialogTitle>
          <DialogDescription>
            Send reklamasjonsdetaljer til {supplierName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-4">
          <FormField
            label="E-postadresse til leverandør"
            required
            error={errors.supplierEmail}
          >
            <Input
              type="email"
              placeholder="leverandor@example.com"
              value={formData.supplierEmail}
              onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })}
            />
          </FormField>

          <FormField
            label="Språk for e-post"
            error={errors.language}
          >
            <Select 
              value={formData.language} 
              onValueChange={(value: 'no' | 'en') => setFormData({ ...formData, language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg språk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">🇳🇴 Norsk</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium mb-2">E-posten vil inneholde:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Komplett produktinformasjon</li>
              <li>Feilbeskrivelse og detaljer</li>
              <li>Kundeinformasjon</li>
              <li>Utført arbeid og kostnader</li>
              <li>Kostnadsoversikt</li>
            </ul>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleDialogClose(false)}
            >
              Avbryt
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              <ButtonLoading
                isLoading={isSubmitting}
                loadingText="Sender..."
              >
                Send e-post
              </ButtonLoading>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SendSupplierEmailDialog;