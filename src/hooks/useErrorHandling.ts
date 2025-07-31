/**
 * React hook for handling asynchronous operations with automatic error handling
 */
import { useState, useCallback } from 'react';
import { ErrorHandler } from '@/utils/errorHandler';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAsyncOperation = <T = any>() => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
      context?: string;
      showSuccessToast?: string;
      showErrorToast?: boolean;
    }
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await operation();
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      if (options?.showSuccessToast) {
        // Success toast is handled by ErrorHandler
      }

      return result;
    } catch (error) {
      const appError = ErrorHandler.handle(
        error, 
        options?.context, 
        options?.showErrorToast !== false
      );
      
      setState({
        data: null,
        loading: false,
        error: appError.message
      });

      if (options?.onError) {
        options.onError(error);
      }

      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};

/**
 * React hook for handling forms with validation and error handling
 */
export const useFormHandler = <T extends Record<string, any>>() => {
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleSubmit = useCallback(async (
    submitFn: (data: T) => Promise<any>,
    options?: {
      validate?: (data: T) => Record<string, string>;
      onSuccess?: (result: any) => void;
      onError?: (error: any) => void;
      context?: string;
    }
  ) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      // Run validation if provided
      if (options?.validate) {
        const validationErrors = options.validate(formData);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return false;
        }
      }

      const result = await submitFn(formData);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      }

      return true;
    } catch (error) {
      ErrorHandler.handle(error, options?.context);
      
      if (options?.onError) {
        options.onError(error);
      }
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, clearErrors]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    setFieldError,
    clearErrors,
    handleSubmit,
    setFormData
  };
};

/**
 * Hook for handling retry operations with exponential backoff
 */
export const useRetryOperation = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      baseDelay?: number;
      context?: string;
      onRetry?: (attempt: number) => void;
    }
  ): Promise<T | null> => {
    const maxRetries = options?.maxRetries || 3;
    const baseDelay = options?.baseDelay || 1000;

    setIsRetrying(true);
    setRetryCount(0);

    try {
      const retryFn = ErrorHandler.createRetryHandler(operation, maxRetries, baseDelay);
      const result = await retryFn();
      return result;
    } catch (error) {
      ErrorHandler.handle(error, options?.context);
      return null;
    } finally {
      setIsRetrying(false);
      setRetryCount(0);
    }
  }, []);

  return {
    executeWithRetry,
    retryCount,
    isRetrying
  };
};