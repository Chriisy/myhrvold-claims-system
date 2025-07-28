import { ClaimWithRelations } from '@/services/claimService';
import { Tables } from '@/integrations/supabase/types';

// Helper function to map database enums to Norwegian display text
export const mapStatusToNorwegian = (status: Tables<'claims'>['status']): string => {
  const statusMap: Record<Tables<'claims'>['status'], string> = {
    'new': 'Ny',
    'pending_approval': 'Venter på godkjenning',
    'under_processing': 'Under behandling',
    'sent_supplier': 'Sendt til leverandør',
    'awaiting_response': 'Venter på svar',
    'resolved': 'Løst',
    'rejected': 'Avvist'
  };
  return statusMap[status] || status;
};

export const mapUrgencyToNorwegian = (urgency: Tables<'claims'>['urgency_level']): string => {
  const urgencyMap: Record<Tables<'claims'>['urgency_level'], string> = {
    'low': 'Lav',
    'normal': 'Normal',
    'high': 'Høy',
    'critical': 'Kritisk'
  };
  return urgencyMap[urgency] || urgency;
};

export const mapIssueTypeToNorwegian = (type: Tables<'claims'>['issue_type']): string => {
  const typeMap: Record<Tables<'claims'>['issue_type'], string> = {
    'warranty': 'Garanti',
    'claim': 'Reklamasjon',
    'service_callback': 'Service tilbakekall',
    'extended_warranty': 'Utvidet garanti'
  };
  return typeMap[type] || type;
};

// Transform Supabase claim data to our UI format
export const transformClaimForUI = (claim: ClaimWithRelations) => {
  // Parse custom line items from database
  let customLineItems = [];
  if (claim.custom_line_items) {
    try {
      customLineItems = typeof claim.custom_line_items === 'string' 
        ? JSON.parse(claim.custom_line_items) 
        : claim.custom_line_items;
    } catch (error) {
      console.error('Error parsing custom_line_items:', error);
      customLineItems = [];
    }
  }
  
  return {
    id: claim.claim_number,
    status: mapStatusToNorwegian(claim.status),
    customer: {
      name: claim.customer_name,
      contactPerson: claim.customer_contact || '',
      email: claim.customer_email || '',
      phone: claim.customer_phone || '',
      address: claim.customer_address || ''
    },
    product: {
      name: claim.product_name,
      serialNumber: claim.serial_number || '',
      purchaseDate: claim.purchase_date || '',
      warranty: claim.warranty_period || '',
      supplier: claim.supplier
    },
    issue: {
      type: mapIssueTypeToNorwegian(claim.issue_type),
      description: claim.issue_description,
      urgency: mapUrgencyToNorwegian(claim.urgency_level)
    },
    economics: {
      workHours: claim.work_hours || 0,
      hourlyRate: claim.hourly_rate || 0,
      overtime50Hours: claim.overtime_50_hours || 0,
      overtime100Hours: claim.overtime_100_hours || 0,
      travelHours: claim.travel_hours || 0,
      travelDistanceKm: claim.travel_distance_km || 0,
      vehicleCostPerKm: claim.vehicle_cost_per_km || 7.5,
      customLineItems: customLineItems,
      partsCost: claim.parts_cost || 0,
      travelCost: claim.travel_cost || 0,
      consumablesCost: claim.consumables_cost || 0,
      externalServicesCost: claim.external_services_cost || 0,
      totalCost: claim.total_cost || 0,
      expectedRefund: claim.expected_refund || 0,
      actualRefund: claim.actual_refund,
      refundStatus: claim.refund_status,
      netCost: claim.net_cost,
      refundedWorkCost: claim.refunded_work_cost || 0,
      refundedPartsCost: claim.refunded_parts_cost || 0,
      refundedTravelCost: claim.refunded_travel_cost || 0,
      refundedVehicleCost: claim.refunded_vehicle_cost || 0,
      refundedOtherCost: claim.refunded_other_cost || 0,
      totalRefunded: claim.total_refunded || 0
    },
    technician: claim.technician_name,
    createdDate: new Date(claim.created_date).toLocaleDateString('no-NO'),
    lastUpdated: new Date(claim.updated_date).toLocaleDateString('no-NO'),
    files: claim.files ? (claim.files as any[]) : [],
    timeline: claim.timeline?.map(t => ({
      date: new Date(t.changed_date).toLocaleString('no-NO'),
      action: `Status endret til: ${mapStatusToNorwegian(t.status)}`,
      user: t.changed_by,
      status: mapStatusToNorwegian(t.status)
    })) || []
  };
};