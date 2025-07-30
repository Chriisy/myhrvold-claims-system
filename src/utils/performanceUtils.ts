/**
 * Performance optimization utilities
 */

/**
 * Optimized array length check - uses optional chaining
 */
export const hasItems = <T>(array: T[] | undefined | null): boolean => {
  return Boolean(array?.length);
};

/**
 * Safe array length check that prevents undefined errors
 */
export const getArrayLength = <T>(array: T[] | undefined | null): number => {
  return array?.length ?? 0;
};

/**
 * Debounce function for search inputs and API calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Generate stable keys for list items when using array indices
 */
export const generateStableKey = (item: any, index: number, prefix = 'item'): string => {
  if (item?.id) return `${prefix}-${item.id}`;
  if (item?.name) return `${prefix}-${item.name}-${index}`;
  if (item?.key) return `${prefix}-${item.key}`;
  return `${prefix}-${index}-${JSON.stringify(item).slice(0, 20)}`;
};

/**
 * Batch state updates to improve performance
 */
export const batchUpdates = (updates: (() => void)[]): void => {
  updates.forEach(update => update());
};