import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateClaimStatus } from "@/hooks/useClaimMutations";
import { Tables } from "@/integrations/supabase/types";
import { ButtonLoading } from "@/components/ui/loading";

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claimId: string;
  currentStatus: Tables<'claims'>['status'];
}

const STATUS_OPTIONS: { value: Tables<'claims'>['status']; label: string; color: string }[] = [
  { value: 'new', label: 'Ny', color: 'bg-accent/10 text-accent border-accent/20' },
  { value: 'pending_approval', label: 'Venter på godkjenning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'under_processing', label: 'Under behandling', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  { value: 'sent_supplier', label: 'Sendt til leverandør', color: 'bg-primary/10 text-primary border-primary/20' },
  { value: 'awaiting_response', label: 'Venter på svar', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'resolved', label: 'Løst', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'rejected', label: 'Avvist', color: 'bg-red-100 text-red-800 border-red-200' },
];

export const UpdateStatusDialog = ({ open, onOpenChange, claimId, currentStatus }: UpdateStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<Tables<'claims'>['status']>(currentStatus);
  const [notes, setNotes] = useState("");
  const updateStatusMutation = useUpdateClaimStatus();

  const handleSubmit = () => {
    updateStatusMutation.mutate({
      claimId,
      status: selectedStatus,
      notes: notes.trim() || undefined
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setNotes("");
      }
    });
  };

  const currentStatusLabel = STATUS_OPTIONS.find(s => s.value === currentStatus)?.label;
  const selectedStatusLabel = STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Oppdater status</DialogTitle>
          <DialogDescription>
            Endre status for denne reklamasjonen. Nåværende status: <strong>{currentStatusLabel}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Ny status</Label>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as Tables<'claims'>['status'])}>
              <SelectTrigger>
                <SelectValue placeholder="Velg ny status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${option.color}`}>
                        {option.label}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notat (valgfritt)</Label>
            <Textarea
              id="notes"
              placeholder="Legg til en kommentar om statusendringen..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateStatusMutation.isPending || selectedStatus === currentStatus}
          >
            <ButtonLoading
              isLoading={updateStatusMutation.isPending}
              loadingText="Oppdaterer..."
            >
              Oppdater til {selectedStatusLabel}
            </ButtonLoading>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};