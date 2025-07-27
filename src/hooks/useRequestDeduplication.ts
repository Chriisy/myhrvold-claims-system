import { useCallback, useRef } from 'react';

interface RequestCache {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
  };
}

// Global cache for deduplicating requests
const globalRequestCache: RequestCache = {};
const CACHE_DURATION = 30000; // 30 seconds

// Clean up expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  Object.keys(globalRequestCache).forEach(key => {
    if (now - globalRequestCache[key].timestamp > CACHE_DURATION) {
      delete globalRequestCache[key];
    }
  });
};

// Run cleanup every minute
setInterval(cleanupCache, 60000);

export const useRequestDeduplication = () => {
  const activeRequestsRef = useRef<Set<string>>(new Set());

  const deduplicateRequest = useCallback(async <T>(
    key: string,
    requestFn: () => Promise<T>,
    cacheDuration: number = CACHE_DURATION
  ): Promise<T> => {
    const now = Date.now();
    
    // Check if we have a cached result
    const cached = globalRequestCache[key];
    if (cached && now - cached.timestamp < cacheDuration) {
      return cached.promise;
    }

    // Check if this request is already in progress
    if (activeRequestsRef.current.has(key)) {
      // Wait for the existing request
      return globalRequestCache[key]?.promise || requestFn();
    }

    // Mark request as active
    activeRequestsRef.current.add(key);

    // Create new request
    const promise = requestFn()
      .finally(() => {
        // Remove from active requests when done
        activeRequestsRef.current.delete(key);
      });

    // Cache the promise
    globalRequestCache[key] = {
      promise,
      timestamp: now,
    };

    return promise;
  }, []);

  const clearCache = useCallback((keyPattern?: string) => {
    if (keyPattern) {
      Object.keys(globalRequestCache).forEach(key => {
        if (key.includes(keyPattern)) {
          delete globalRequestCache[key];
        }
      });
    } else {
      Object.keys(globalRequestCache).forEach(key => {
        delete globalRequestCache[key];
      });
    }
  }, []);

  return {
    deduplicateRequest,
    clearCache,
  };
};