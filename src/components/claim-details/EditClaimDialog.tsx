import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EditClaimDialogProps {
  claimId: string;
}

export const EditClaimDialog = ({ claimId }: EditClaimDialogProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleEditClaim = () => {
    navigate(`/claims/${claimId}/edit`);
    setOpen(false);
  };

  const handleEditEconomics = () => {
    navigate(`/claims/${claimId}/economics`);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Rediger
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rediger reklamasjon</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Velg hvilken del av reklamasjonen du ønsker å redigere:
          </p>
          
          <div className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleEditClaim}
            >
              <Edit className="h-4 w-4 mr-2" />
              Grunnleggende informasjon
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleEditEconomics}
            >
              <Edit className="h-4 w-4 mr-2" />
              Økonomisk informasjon
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};