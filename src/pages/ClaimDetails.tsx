import { useState } from "react";
import { useParams } from "react-router-dom";
import { useClaim } from "@/hooks/useClaim";
import { transformClaimForUI } from "@/utils/claim-transforms";
import { ClaimHeader } from "@/components/claim-details/ClaimHeader";
import { CustomerInfo } from "@/components/claim-details/CustomerInfo";
import { ProductInfo } from "@/components/claim-details/ProductInfo";
import { IssueDescription } from "@/components/claim-details/IssueDescription";
import { ClaimFiles } from "@/components/claim-details/ClaimFiles";
import { ClaimTimeline } from "@/components/claim-details/ClaimTimeline";
import { QuickActions } from "@/components/claim-details/QuickActions";
import SendSupplierEmailDialog from "@/components/SendSupplierEmailDialog";

const ClaimDetails = () => {
  const { id } = useParams();
  const { data: claimData, isLoading, error } = useClaim(id);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laster reklamasjon...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Feil</h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : 'Kunne ikke laste reklamasjon'}
          </p>
        </div>
      </div>
    );
  }

  if (!claimData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Ikke funnet</h1>
          <p className="text-muted-foreground">Reklamasjon med ID {id} ble ikke funnet</p>
        </div>
      </div>
    );
  }

  const claim = transformClaimForUI(claimData);

  return (
    <div className="min-h-screen bg-background">
      <ClaimHeader claim={claim} />

      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CustomerInfo customer={claim.customer} />
            <ProductInfo product={claim.product} />
            <IssueDescription issue={claim.issue} />
            <ClaimFiles files={claim.files} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ClaimTimeline timeline={claim.timeline} />
            <QuickActions onSendToSupplier={() => setEmailDialogOpen(true)} />
          </div>
        </div>
      </main>

      <SendSupplierEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        claimId={claim.id}
        supplierName={claim.product.supplier}
        defaultEmail=""
      />
    </div>
  );
};

export default ClaimDetails;