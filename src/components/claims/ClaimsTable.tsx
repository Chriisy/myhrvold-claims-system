import React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit } from 'lucide-react';
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
      key: 'created_date',
      header: 'Opprettet',
      sortable: true,
      width: '120px',
      render: (claim) => new Date(claim.created_date).toLocaleDateString('no-NO')
    },
    {
      key: 'id',
      header: 'Handlinger',
      width: '120px',
      render: (claim) => (
        <div className="flex gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link to={`/claims/${claim.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to={`/claims/${claim.id}/edit`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )
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
    />
  );
};