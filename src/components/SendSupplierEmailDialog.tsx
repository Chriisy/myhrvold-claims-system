import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send } from 'lucide-react';

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
  const [language, setLanguage] = useState<'no' | 'en'>('no');
  const [supplierEmail, setSupplierEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!supplierEmail.trim()) {
      toast({
        title: "Feil",
        description: "Vennligst oppgi leverandørens e-postadresse",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-supplier-email', {
        body: {
          claimId,
          language,
          supplierEmail: supplierEmail.trim()
        }
      });

      if (error) throw error;

      toast({
        title: "E-post sendt",
        description: `E-post ble sendt til ${supplierName} (${supplierEmail})`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Feil ved sending",
        description: error.message || "Kunne ikke sende e-post til leverandør",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-email">E-postadresse til leverandør</Label>
            <Input
              id="supplier-email"
              type="email"
              placeholder="leverandor@example.com"
              value={supplierEmail}
              onChange={(e) => setSupplierEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Språk for e-post</Label>
            <Select value={language} onValueChange={(value: 'no' | 'en') => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg språk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">🇳🇴 Norsk</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSendEmail} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sender...' : 'Send e-post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendSupplierEmailDialog;