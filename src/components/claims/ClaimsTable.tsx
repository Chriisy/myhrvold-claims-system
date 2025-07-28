import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';


import { Link } from 'react-router-dom';
import { ClaimListItem, TableColumn } from '@/types';
import { useSortableTable } from '@/hooks/useTable';
import { mapStatusToNorwegian, mapUrgencyToNorwegian } from '@/utils/claim-transforms';

interface ClaimsTableProps {
  claims: ClaimListItem[];
  loading?: boolean;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({ 
  claims, 
  loading = false 
}) => {
  const { sortedData, sortKey, sortDirection, handleSort } = useSortableTable({
    data: claims,
    defaultSortKey: 'created_date',
    defaultSortDirection: 'desc'
  });

  const columns: TableColumn<ClaimListItem>[] = [
    {
      key: 'claim_number',
      header: 'Reklamasjonsnr.',
      sortable: true,
      width: '140px',
      render: (claim) => (
        <Link to={`/claims/${claim.id}`} className="font-medium text-primary hover:underline">
          {claim.claim_number}
        </Link>
      )
    },
    {
      key: 'customer_name',
      header: 'Kunde',
      sortable: true,
      render: (claim) => (
        <div>
          <p className="font-medium">{claim.customer_name}</p>
          <p className="text-xs text-muted-foreground">{claim.product_name}</p>
        </div>
      )
    },
    {
      key: 'supplier',
      header: 'Leverandør',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '120px',
      render: (claim) => (
        <Badge variant="outline">
          {mapStatusToNorwegian(claim.status)}
        </Badge>
      )
    },
    {
      key: 'urgency_level',
      header: 'Prioritet',
      sortable: true,
      width: '100px',
      render: (claim) => (
        <Badge 
          variant={claim.urgency_level === 'high' || claim.urgency_level === 'critical' ? 'destructive' : 'secondary'}
        >
          {mapUrgencyToNorwegian(claim.urgency_level)}
        </Badge>
      )
    },
    {
      key: 'technician_name',
      header: 'Tekniker',
      sortable: true,
    },
    {
      key: 'total_cost',
      header: 'Kostnad',
      sortable: false,
      width: '100px',
      render: (claim) => {
        const totalCost = (claim.work_hours || 0) * (claim.hourly_rate || 0) + 
                         (claim.overtime_50_hours || 0) * (claim.hourly_rate || 0) * 1.5 +
                         (claim.overtime_100_hours || 0) * (claim.hourly_rate || 0) * 2 +
                         (claim.travel_hours || 0) * (claim.hourly_rate || 0) +
                         (claim.travel_distance_km || 0) * (claim.vehicle_cost_per_km || 7.5) +
                         (claim.parts_cost || 0) + 
                         (claim.travel_cost || 0) + 
                         (claim.consumables_cost || 0) + 
                         (claim.external_services_cost || 0);
        
        return (
          <span className="font-medium">
            {new Intl.NumberFormat('no-NO', {
              style: 'currency',
              currency: 'NOK',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(totalCost)}
          </span>
        );
      }
    },
    {
      key: 'created_date',
      header: 'Opprettet',
      sortable: true,
      width: '120px',
      render: (claim) => new Date(claim.created_date).toLocaleDateString('no-NO')
    }
  ];

  return (
    <DataTable
      data={sortedData}
      columns={columns}
      loading={loading}
      emptyMessage="Ingen reklamasjoner funnet"
      onSort={handleSort}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onRowClick={(claim) => `/claims/${claim.id}`}
    />
  );
};