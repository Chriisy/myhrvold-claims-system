import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CheckCircle2, Mail, Trash2, FileDown } from "lucide-react";
import { ButtonLoading } from "@/components/ui/loading";
import { useUpdateClaimStatus, useDeleteClaim } from "@/hooks/useClaimMutations";
import { useAuth } from "@/hooks/useOptimizedAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedToast } from "@/hooks/useEnhancedToast";
import { useState } from "react";
import { generateClaimPDF } from "@/utils/pdfGenerator";
import { useQueryClient } from '@tanstack/react-query';

interface QuickActionsProps {
  claimId: string;
  createdBy: string;
  onSendToSupplier: () => void;
  claimData?: any; // Add claim data prop
}

export const QuickActions = ({ claimId, createdBy, onSendToSupplier, claimData }: QuickActionsProps) => {
  const updateStatusMutation = useUpdateClaimStatus();
  const deleteClaimMutation = useDeleteClaim();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useEnhancedToast();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const queryClient = useQueryClient();

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

  const handleDownloadPDF = async (language: 'no' | 'en') => {
    try {
      setIsGeneratingPDF(true);
      
      // Invalidate cache to ensure we get the latest data
      await queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
      
      let claimToUse = claimData;
      
      // If no claim data provided, fetch it fresh from database
      if (!claimToUse) {
        const { data: claim, error: claimError } = await supabase
          .from('claims')
          .select('*')
          .eq('id', claimId)
          .single();

        if (claimError || !claim) {
          throw new Error('Could not fetch claim data');
        }
        claimToUse = claim;
      }

      // Generate and download PDF using jsPDF
      await generateClaimPDF(claimToUse, language);

      toast({
        title: "PDF nedlastet",
        description: `Reklamasjonsdokument på ${language === 'no' ? 'norsk' : 'engelsk'} er lastet ned.`,
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Feil ved nedlasting",
        description: "Kunne ikke laste ned PDF. Prøv igjen senere.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Check if user can delete this claim (admin or creator, saksbehandler can only delete own)
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

        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => handleDownloadPDF('no')}
            disabled={isGeneratingPDF}
          >
            <FileDown className="h-4 w-4 mr-2" />
            <ButtonLoading
              isLoading={isGeneratingPDF}
              loadingText="Genererer..."
            >
              Last ned PDF (NO)
            </ButtonLoading>
          </Button>
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => handleDownloadPDF('en')}
            disabled={isGeneratingPDF}
          >
            <FileDown className="h-4 w-4 mr-2" />
            <ButtonLoading
              isLoading={isGeneratingPDF}
              loadingText="Generating..."
            >
              Download PDF (EN)
            </ButtonLoading>
          </Button>
        </div>
        
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