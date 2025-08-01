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
  let customLineItems = [];
  if (claimData.custom_line_items) {
    try {
      customLineItems = typeof claimData.custom_line_items === 'string' 
        ? JSON.parse(claimData.custom_line_items) 
        : claimData.custom_line_items;
    } catch (error) {
      console.error('Error parsing custom_line_items:', error);
      customLineItems = [];
    }
  }

  // Calculate costs consistently
  const workCost = Number(claimData.work_hours || 0) * Number(claimData.hourly_rate || 0);
  const overtime50Cost = Number(claimData.overtime_50_hours || 0) * Number(claimData.hourly_rate || 0) * 1.5;
  const overtime100Cost = Number(claimData.overtime_100_hours || 0) * Number(claimData.hourly_rate || 0) * 2;
  const travelTimeCost = Number(claimData.travel_hours || 0) * Number(claimData.hourly_rate || 0);
  const vehicleCost = Number(claimData.travel_distance_km || 0) * Number(claimData.vehicle_cost_per_km || 7.5);
  const customLineItemsTotal = customLineItems.reduce((sum: number, item: any) => 
    sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  
  const partsCost = Number(claimData.parts_cost || 0);
  const travelCost = Number(claimData.travel_cost || 0);  
  const consumablesCost = Number(claimData.consumables_cost || 0);
  const externalServicesCost = Number(claimData.external_services_cost || 0);
  
  // Avoid double counting: if custom line items exist, use them instead of parts_cost
  const actualPartsCost = customLineItemsTotal > 0 ? customLineItemsTotal : partsCost;
  
  // Use calculated total cost for consistency - avoid double counting parts
  const calculatedTotalCost = workCost + overtime50Cost + overtime100Cost + travelTimeCost + vehicleCost + 
                              actualPartsCost + travelCost + consumablesCost + externalServicesCost;
  const totalRefunded = Number(claimData.refunded_work_cost || 0) + Number(claimData.refunded_parts_cost || 0) + 
                        Number(claimData.refunded_travel_cost || 0) + Number(claimData.refunded_vehicle_cost || 0) + 
                        Number(claimData.refunded_other_cost || 0);
  // Use actual_refund if it's higher than the sum of individual refunded costs
  const actualTotalRefunded = Math.max(totalRefunded, Number(claimData.actual_refund || 0));
  const calculatedNetCost = calculatedTotalCost - actualTotalRefunded;
  
  const economicData = {
    workHours: claimData.work_hours || 0,
    hourlyRate: claimData.hourly_rate || 0,
    overtime50Hours: claimData.overtime_50_hours || 0,
    overtime100Hours: claimData.overtime_100_hours || 0,
    travelHours: claimData.travel_hours || 0,
    travelDistanceKm: claimData.travel_distance_km || 0,
    vehicleCostPerKm: claimData.vehicle_cost_per_km || 7.5,
    customLineItems: customLineItems,
    partsCost: partsCost,
    travelCost: travelCost,
    consumablesCost: consumablesCost,
    externalServicesCost: externalServicesCost,
    totalCost: calculatedTotalCost, // Use calculated value for consistency
    expectedRefund: claimData.expected_refund || 0,
    actualRefund: claimData.actual_refund,
    refundStatus: claimData.refund_status,
    netCost: calculatedNetCost, // Use calculated value for consistency
    refundedWorkCost: claimData.refunded_work_cost,
    refundedPartsCost: claimData.refunded_parts_cost,
    refundedTravelCost: claimData.refunded_travel_cost,
    refundedVehicleCost: claimData.refunded_vehicle_cost,
    refundedOtherCost: claimData.refunded_other_cost,
    totalRefunded: actualTotalRefunded
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
                claimData={claimData}
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