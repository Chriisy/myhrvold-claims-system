import React, { memo, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OptimizedClaimsFiltersProps {
  filters: {
    status: string[];
    department: string[];
    urgencyLevel: string[];
    supplier: string[];
    dateFrom: string;
    dateTo: string;
    search: string;
  };
  onFilterChange: (key: string, value: any) => void;
  statusOptions: Array<{ value: string; label: string; count: number }>;
  departmentOptions: Array<{ value: string; label: string; count: number }>;
  urgencyOptions: Array<{ value: string; label: string; count: number }>;
  supplierOptions: Array<{ value: string; label: string; count: number }>;
}

export const OptimizedClaimsFilters = memo<OptimizedClaimsFiltersProps>(({
  filters,
  onFilterChange,
  statusOptions,
  departmentOptions,
  urgencyOptions,
  supplierOptions
}) => {
  // Memoized handlers to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('search', e.target.value);
  }, [onFilterChange]);

  const handleDateFromChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('dateFrom', e.target.value);
  }, [onFilterChange]);

  const handleDateToChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange('dateTo', e.target.value);
  }, [onFilterChange]);

  const handleStatusChange = useCallback((value: string) => {
    const currentStatus = filters.status;
    const newStatus = currentStatus.includes(value)
      ? currentStatus.filter(s => s !== value)
      : [...currentStatus, value];
    onFilterChange('status', newStatus);
  }, [filters.status, onFilterChange]);

  const clearFilters = useCallback(() => {
    onFilterChange('status', []);
    onFilterChange('department', []);
    onFilterChange('urgencyLevel', []);
    onFilterChange('supplier', []);
    onFilterChange('search', '');
    onFilterChange('dateFrom', '');
    onFilterChange('dateTo', '');
  }, [onFilterChange]);

  // Memoized total count to prevent recalculation
  const totalActiveFilters = useMemo(() => {
    return filters.status.length + 
           filters.department.length + 
           filters.urgencyLevel.length + 
           filters.supplier.length + 
           (filters.search ? 1 : 0) +
           (filters.dateFrom ? 1 : 0) +
           (filters.dateTo ? 1 : 0);
  }, [filters]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filtre</h3>
        {totalActiveFilters > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters}>
            Nullstill ({totalActiveFilters})
          </Button>
        )}
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Søk i reklamasjoner..."
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      {/* Date filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Fra dato</label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Til dato</label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={handleDateToChange}
          />
        </div>
      </div>

      {/* Status filters */}
      <div>
        <label className="text-sm font-medium">Status</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={filters.status.includes(option.value) ? "default" : "outline"}
              size="sm"
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label} ({option.count})
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

OptimizedClaimsFilters.displayName = 'OptimizedClaimsFilters';