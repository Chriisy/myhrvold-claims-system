import { useState, useMemo } from 'react';
import { TableColumn } from '@/types';

interface UseSortableTableProps<T> {
  data: T[];
  defaultSortKey?: keyof T;
  defaultSortDirection?: 'asc' | 'desc';
}

export function useSortableTable<T>({
  data,
  defaultSortKey,
  defaultSortDirection = 'asc'
}: UseSortableTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'no');
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const comparison = String(aValue).localeCompare(String(bValue), 'no');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: keyof T, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort
  };
}

interface UseFilterableDataProps<T> {
  data: T[];
  filterFn: (item: T, filters: Record<string, any>) => boolean;
}

export function useFilterableData<T>({
  data,
  filterFn
}: UseFilterableDataProps<T>) {
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredData = useMemo(() => {
    if (Object.keys(filters).length === 0) return data;
    return data.filter(item => filterFn(item, filters));
  }, [data, filters, filterFn]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    filteredData,
    filters,
    updateFilter,
    removeFilter,
    clearFilters
  };
}