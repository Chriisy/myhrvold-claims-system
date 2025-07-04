import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { ButtonLoading } from '@/components/ui/loading';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import { supplierEmailSchema, SupplierEmailFormData } from '@/schemas/validationSchemas';

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

  const form = useForm<SupplierEmailFormData>({
    resolver: zodResolver(supplierEmailSchema),
    defaultValues: {
      supplierEmail: defaultEmail,
      language: 'no'
    }
  });

  const onSubmit = async (data: SupplierEmailFormData) => {
    try {
      const { error } = await supabase.functions.invoke('send-supplier-email', {
        body: {
          claimId,
          language: data.language,
          supplierEmail: data.supplierEmail.trim()
        }
      });

      if (error) throw error;

      showSuccess(
        "E-post sendt",
        `E-post ble sendt til ${supplierName} (${data.supplierEmail})`
      );

      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error sending email:', error);
      showError(
        "Feil ved sending",
        error.message || "Kunne ikke sende e-post til leverandør"
      );
    }
  };

  const handleDialogClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="supplierEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-postadresse til leverandør</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="leverandor@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Språk for e-post</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg språk" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no">🇳🇴 Norsk</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={form.formState.isSubmitting}
              >
                <ButtonLoading
                  isLoading={form.formState.isSubmitting}
                  loadingText="Sender..."
                >
                  Send e-post
                </ButtonLoading>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SendSupplierEmailDialog;