import { memo, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";

interface OptimizedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  loading?: boolean;
  pageSize?: number;
}

export const OptimizedTable = memo(<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  loading = false,
  pageSize = 20
}: OptimizedTableProps<T>) => {
  
  // Memoize rendered rows to prevent unnecessary re-renders
  const renderedRows = useMemo(() => {
    return data.slice(0, pageSize).map((item) => (
      <TableRow
        key={item.id}
        item={item}
        columns={columns as any}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ));
  }, [data, columns, onEdit, onDelete, pageSize]);

  if (loading) {
    return (
      <div className="w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded mb-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column) => (
              <th key={String(column.key)} className="text-left p-2 font-medium">
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && (
              <th className="text-left p-2 font-medium">Handlinger</th>
            )}
          </tr>
        </thead>
        <tbody>
          {renderedRows}
        </tbody>
      </table>
    </div>
  );
});

// Separate memoized row component to prevent unnecessary re-renders
const TableRow = memo(<T extends { id: string | number }>({
  item,
  columns,
  onEdit,
  onDelete
}: {
  item: T;
  columns: Array<{
    key: keyof T;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }>;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}) => {
  const handleEdit = useCallback(() => onEdit?.(item), [onEdit, item]);
  const handleDelete = useCallback(() => onDelete?.(item), [onDelete, item]);

  return (
    <tr className="border-b hover:bg-muted/50">
      {columns.map((column) => (
        <td key={String(column.key)} className="p-2">
          {column.render ? column.render(item) : String(item[column.key] || '')}
        </td>
      ))}
      {(onEdit || onDelete) && (
        <td className="p-2">
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

(OptimizedTable as any).displayName = 'OptimizedTable';
(TableRow as any).displayName = 'TableRow';