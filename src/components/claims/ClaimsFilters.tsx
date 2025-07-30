import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { ClaimFilters, ClaimStatus, Department, UrgencyLevel } from '@/types';
import { mapStatusToNorwegian, mapUrgencyToNorwegian } from '@/utils/claim-transforms';

interface ClaimsFiltersProps {
  filters: ClaimFilters;
  onFiltersChange: (filters: ClaimFilters) => void;
  onClearFilters: () => void;
}

export const ClaimsFilters: React.FC<ClaimsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const statusOptions: { value: ClaimStatus; label: string }[] = [
    { value: 'new', label: mapStatusToNorwegian('new') },
    { value: 'pending_approval', label: mapStatusToNorwegian('pending_approval') },
    { value: 'under_processing', label: mapStatusToNorwegian('under_processing') },
    { value: 'sent_supplier', label: mapStatusToNorwegian('sent_supplier') },
    { value: 'awaiting_response', label: mapStatusToNorwegian('awaiting_response') },
    { value: 'resolved', label: mapStatusToNorwegian('resolved') },
    { value: 'rejected', label: mapStatusToNorwegian('rejected') }
  ];

  const urgencyOptions: { value: UrgencyLevel; label: string }[] = [
    { value: 'low', label: mapUrgencyToNorwegian('low') },
    { value: 'normal', label: mapUrgencyToNorwegian('normal') },
    { value: 'high', label: mapUrgencyToNorwegian('high') },
    { value: 'critical', label: mapUrgencyToNorwegian('critical') }
  ];

  const departmentOptions: { value: Department; label: string }[] = [
    { value: 'oslo', label: 'Oslo' },
    { value: 'bergen', label: 'Bergen' },
    { value: 'trondheim', label: 'Trondheim' },
    { value: 'stavanger', label: 'Stavanger' },
    { value: 'kristiansand', label: 'Kristiansand' },
    { value: 'nord_norge', label: 'Nord-Norge' },
    { value: 'innlandet', label: 'Innlandet' },
    { value: 'vestfold', label: 'Vestfold' },
    { value: 'agder', label: 'Agder' },
    { value: 'ekstern', label: 'Ekstern' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  const activeFilterCount = [
    filters.status?.length || 0,
    filters.department?.length || 0,
    filters.urgencyLevel?.length || 0,
    filters.supplier?.length || 0,
    filters.search ? 1 : 0,
    filters.dateFrom ? 1 : 0,
    filters.dateTo ? 1 : 0,
  ].reduce((acc, curr) => acc + curr, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtre
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Filtrer reklamasjoner basert på ulike kriterier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Søk</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Søk i reklamasjoner..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={filters.status?.join(',') || ''} 
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                status: value ? value.split(',') as ClaimStatus[] : undefined 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Urgency Filter */}
        <div className="space-y-2">
          <Label>Prioritet</Label>
          <Select 
            value={filters.urgencyLevel?.join(',') || ''} 
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                urgencyLevel: value ? value.split(',') as UrgencyLevel[] : undefined 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg prioritet" />
            </SelectTrigger>
            <SelectContent>
              {urgencyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <Label>Avdeling</Label>
          <Select 
            value={filters.department?.join(',') || ''} 
            onValueChange={(value) => 
              onFiltersChange({ 
                ...filters, 
                department: value ? value.split(',') as Department[] : undefined 
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Velg avdeling" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>Fra dato</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Til dato</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Fjern alle filtre
          </Button>
        )}
      </CardContent>
    </Card>
  );
};