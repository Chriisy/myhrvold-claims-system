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