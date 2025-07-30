import React, { memo } from 'react';

// Memoized components to improve performance by preventing unnecessary re-renders

interface OptimizedTableRowProps {
  data: any;
  index: number;
  onRowClick?: (data: any) => void;
  children: React.ReactNode;
}

export const OptimizedTableRow = memo(({ data, index, onRowClick, children }: OptimizedTableRowProps) => (
  <tr 
    className={onRowClick ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
    onClick={() => onRowClick?.(data)}
  >
    {children}
  </tr>
));

OptimizedTableRow.displayName = 'OptimizedTableRow';

interface OptimizedListItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const OptimizedListItem = memo(({ id, children, className }: OptimizedListItemProps) => (
  <div key={id} className={className}>
    {children}
  </div>
));

OptimizedListItem.displayName = 'OptimizedListItem';