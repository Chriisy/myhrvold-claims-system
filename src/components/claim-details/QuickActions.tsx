import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail } from "lucide-react";
import { ButtonLoading } from "@/components/ui/loading";
import { useUpdateClaimStatus } from "@/hooks/useClaimMutations";

interface QuickActionsProps {
  claimId: string;
  onSendToSupplier: () => void;
}

export const QuickActions = ({ claimId, onSendToSupplier }: QuickActionsProps) => {
  const updateStatusMutation = useUpdateClaimStatus();

  const handleMarkAsResolved = () => {
    updateStatusMutation.mutate({
      claimId,
      status: 'resolved',
      notes: 'Reklamasjon markert som løst'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hurtighandlinger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleMarkAsResolved}
          disabled={updateStatusMutation.isPending}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          <ButtonLoading
            isLoading={updateStatusMutation.isPending}
            loadingText="Oppdaterer..."
          >
            Marker som løst
          </ButtonLoading>
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onSendToSupplier}
        >
          <Mail className="h-4 w-4 mr-2" />
          Send til leverandør
        </Button>
        <Button className="w-full" variant="outline">
          Kontakt kunde
        </Button>
      </CardContent>
    </Card>
  );
};