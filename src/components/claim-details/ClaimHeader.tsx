import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Claim } from "@/types/claim";
import { getStatusColor, getUrgencyColor } from "@/utils/claim-helpers";
import { UpdateStatusDialog } from "./UpdateStatusDialog";
import { useState } from "react";

interface ClaimHeaderProps {
  claim: Claim;
}

export const ClaimHeader = ({ claim }: ClaimHeaderProps) => {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  return (
    <>
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/claims">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake til liste
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-primary">{claim.id}</h1>
                <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
                <Badge className={getUrgencyColor(claim.issue.urgency)}>{claim.issue.urgency}</Badge>
              </div>
              <p className="text-muted-foreground">Opprettet {claim.createdDate} av {claim.technician}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Rediger
              </Button>
              <Button onClick={() => setIsStatusDialogOpen(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Oppdater status
              </Button>
            </div>
          </div>
        </div>
      </header>

      <UpdateStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        claimId={claim.id}
        currentStatus={claim.status as any}
      />
    </>
  );
};