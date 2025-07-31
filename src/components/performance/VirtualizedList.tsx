import { memo, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
}

export const VirtualizedList = memo(<T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className = ""
}: VirtualizedListProps<T>) => {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer items
  
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = 0; // In a real implementation, this would be based on scroll position
    const end = Math.min(start + visibleCount, items.length);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end)
    };
  }, [items, visibleCount]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div className={`overflow-auto ${className}`} style={{ height: containerHeight }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

(VirtualizedList as any).displayName = 'VirtualizedList';