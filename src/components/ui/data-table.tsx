import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableProps } from '@/types';
import { cn } from '@/lib/utils';

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "Ingen data funnet",
  onSort,
  sortKey,
  sortDirection
}: TableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (!onSort) return;
    
    if (sortKey === key) {
      // Toggle direction
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    } else {
      // New column, default to ascending
      onSort(key, 'asc');
    }
  };

  const getSortIcon = (key: keyof T) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <LoadingState isLoading={true} loadingText="Laster data...">
        <div />
      </LoadingState>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={String(column.key)}
                style={{ width: column.width }}
                className={cn(
                  column.sortable && onSort && "cursor-pointer select-none hover:bg-muted/50",
                  sortKey === column.key && "bg-muted/30"
                )}
                onClick={column.sortable && onSort ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && onSort && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render 
                      ? column.render(item)
                      : String(item[column.key] || '')
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}