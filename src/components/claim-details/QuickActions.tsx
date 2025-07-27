import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, Mail, Trash2 } from "lucide-react";
import { ButtonLoading } from "@/components/ui/loading";
import { useUpdateClaimStatus, useDeleteClaim } from "@/hooks/useClaimMutations";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  claimId: string;
  createdBy: string;
  onSendToSupplier: () => void;
}

export const QuickActions = ({ claimId, createdBy, onSendToSupplier }: QuickActionsProps) => {
  const updateStatusMutation = useUpdateClaimStatus();
  const deleteClaimMutation = useDeleteClaim();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleMarkAsResolved = () => {
    updateStatusMutation.mutate({
      claimId,
      status: 'resolved',
      notes: 'Reklamasjon markert som løst'
    });
  };

  const handleDeleteClaim = () => {
    deleteClaimMutation.mutate(claimId, {
      onSuccess: () => {
        navigate('/claims');
      }
    });
  };

  // Check if user can delete this claim (admin or creator)
  const canDelete = profile?.role === 'admin' || profile?.id === createdBy;

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
        
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className="w-full" 
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Slett reklamasjon
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Denne handlingen kan ikke angres. Reklamasjonen vil bli permanent slettet 
                  sammen med all tilhørende data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteClaim}
                  disabled={deleteClaimMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteClaimMutation.isPending ? (
                    <ButtonLoading isLoading={true} loadingText="Sletter...">
                      Sletter...
                    </ButtonLoading>
                  ) : (
                    'Slett permanent'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};