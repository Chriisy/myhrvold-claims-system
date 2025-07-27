import { useState } from "react";
import { useParams } from "react-router-dom";
import { useClaim } from "@/hooks/useClaim";
import { transformClaimForUI } from "@/utils/claim-transforms";
import { ClaimHeader } from "@/components/claim-details/ClaimHeader";
import { 
  MemoizedCustomerInfo,
  MemoizedProductInfo,
  MemoizedIssueDescription,
  MemoizedClaimFiles,
  MemoizedClaimTimeline,
  MemoizedQuickActions,
  MemoizedEconomicInfo,
  MemoizedOrganizationInfo
} from "@/components/optimized/MemoizedClaimDetails";
import { EditClaimDialog } from "@/components/claim-details/EditClaimDialog";
import { PageLoading } from "@/components/ui/loading";
import { NetworkErrorBoundary } from "@/components/ui/NetworkErrorBoundary";
import SendSupplierEmailDialog from "@/components/SendSupplierEmailDialog";

const ClaimDetails = () => {
  const { id } = useParams();
  const { data: claimData, isLoading, error } = useClaim(id);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  if (isLoading) {
    return <PageLoading text="Laster reklamasjon..." />;
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

  // Prepare economic data
  const economicData = {
    workHours: claimData.work_hours || 0,
    hourlyRate: claimData.hourly_rate || 0,
    partsCost: claimData.parts_cost || 0,
    travelCost: claimData.travel_cost || 0,
    consumablesCost: claimData.consumables_cost || 0,
    externalServicesCost: claimData.external_services_cost || 0,
    totalCost: claimData.total_cost || 0,
    expectedRefund: claimData.expected_refund || 0,
    actualRefund: claimData.actual_refund,
    refundStatus: claimData.refund_status,
    netCost: claimData.net_cost,
    refundedWorkCost: claimData.refunded_work_cost,
    refundedPartsCost: claimData.refunded_parts_cost,
    refundedTravelCost: claimData.refunded_travel_cost,
    refundedVehicleCost: claimData.refunded_vehicle_cost,
    refundedOtherCost: claimData.refunded_other_cost,
    totalRefunded: claimData.total_refunded
  };

  // Prepare organization data
  const organizationData = {
    department: claimData.department,
    technicianName: claimData.technician_name,
    msJobNumber: claimData.ms_job_number,
    evaticJobNumber: claimData.evatic_job_number,
    accountCode: claimData.account_code,
    accountString: claimData.account_string,
    creditNoteNumber: claimData.credit_note_number,
    assignedAdmin: claimData.assigned_admin,
    approvedBy: claimData.approved_by,
    approvedDate: claimData.approved_date,
    createdDate: claimData.created_date,
    updatedDate: claimData.updated_date
  };

  return (
    <NetworkErrorBoundary>
      <div className="min-h-screen bg-background">
        <ClaimHeader claim={claim} />

        <main className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Reklamasjonsdetaljer</h2>
            <EditClaimDialog claimId={claimData.id} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <MemoizedCustomerInfo customer={claim.customer} />
              <MemoizedProductInfo product={claim.product} />
              <MemoizedIssueDescription issue={claim.issue} />
              <MemoizedEconomicInfo data={economicData} />
              <MemoizedOrganizationInfo data={organizationData} />
              <MemoizedClaimFiles files={claim.files} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <MemoizedClaimTimeline timeline={claim.timeline} />
              <MemoizedQuickActions 
                claimId={claimData.id} 
                createdBy={claimData.created_by}
                onSendToSupplier={() => setEmailDialogOpen(true)} 
              />
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
    </NetworkErrorBoundary>
  );
};

export default ClaimDetails;