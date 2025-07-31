import { SupabaseError } from '@/types/api';
import { toast } from '@/hooks/use-toast';

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  context?: string;
}

export class ErrorHandler {
  /**
   * Centralized error handling for the application
   */
  static handle(error: any, context?: string, showToast: boolean = true): AppError {
    const appError = this.normalizeError(error, context);
    
    // Log error for monitoring (only in development for now)
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', appError);
    }
    
    // Show user-friendly toast notification
    if (showToast) {
      this.showErrorToast(appError);
    }
    
    // Report to error logging service if available
    this.reportError(appError);
    
    return appError;
  }

  /**
   * Convert various error types to AppError
   */
  private static normalizeError(error: any, context?: string): AppError {
    const timestamp = new Date();
    
    // Handle Supabase errors
    if (error?.code || error?.message) {
      return {
        code: error.code || 'SUPABASE_ERROR',
        message: this.getSupabaseErrorMessage(error),
        details: { 
          originalError: error,
          hint: error.hint,
          details: error.details 
        },
        timestamp,
        context
      };
    }
    
    // Handle network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Nettverksfeil. Sjekk internettforbindelsen din.',
        details: { originalError: error },
        timestamp,
        context
      };
    }
    
    // Handle validation errors
    if (error?.name === 'ValidationError') {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Ugyldig data oppgitt.',
        details: { originalError: error },
        timestamp,
        context
      };
    }
    
    // Handle generic JavaScript errors
    if (error instanceof Error) {
      return {
        code: 'JAVASCRIPT_ERROR',
        message: error.message || 'En uventet feil oppstod.',
        details: { 
          originalError: error,
          stack: error.stack 
        },
        timestamp,
        context
      };
    }
    
    // Handle string errors
    if (typeof error === 'string') {
      return {
        code: 'GENERIC_ERROR',
        message: error,
        details: {},
        timestamp,
        context
      };
    }
    
    // Fallback for unknown error types
    return {
      code: 'UNKNOWN_ERROR',
      message: 'En ukjent feil oppstod. Prøv igjen.',
      details: { originalError: error },
      timestamp,
      context
    };
  }

  /**
   * Get user-friendly message for Supabase errors
   */
  private static getSupabaseErrorMessage(error: SupabaseError): string {
    const code = error.code;
    const message = error.message?.toLowerCase() || '';
    
    // Authentication errors
    if (code === '23503' || message.includes('foreign key')) {
      return 'Kan ikke slette - data er i bruk andre steder.';
    }
    
    if (code === '23505' || message.includes('duplicate') || message.includes('unique')) {
      return 'Data eksisterer allerede i systemet.';
    }
    
    if (code === '42501' || message.includes('permission')) {
      return 'Du har ikke tilgang til å utføre denne handlingen.';
    }
    
    if (message.includes('row level security')) {
      return 'Sikkerhetsfeil - kontakt administrator.';
    }
    
    if (message.includes('invalid login')) {
      return 'Ugyldig e-post eller passord.';
    }
    
    if (message.includes('email not confirmed')) {
      return 'E-post må bekreftes før innlogging.';
    }
    
    if (message.includes('signup disabled')) {
      return 'Registrering er deaktivert.';
    }
    
    // Connection errors
    if (message.includes('connection') || message.includes('network')) {
      return 'Tilkoblingsfeil - sjekk internettforbindelsen.';
    }
    
    if (message.includes('timeout')) {
      return 'Forespørsel tok for lang tid - prøv igjen.';
    }
    
    // Data validation errors
    if (message.includes('value too long')) {
      return 'Data er for lang for feltet.';
    }
    
    if (message.includes('not null')) {
      return 'Påkrevd felt mangler.';
    }
    
    if (message.includes('invalid input')) {
      return 'Ugyldig data format.';
    }
    
    // Return original message if no specific translation found
    return error.message || 'Database feil oppstod.';
  }

  /**
   * Show user-friendly toast notification
   */
  private static showErrorToast(error: AppError): void {
    // Don't show toast for validation errors (handled by forms)
    if (error.code === 'VALIDATION_ERROR') return;
    
    toast({
      title: 'Feil oppstod',
      description: error.message,
      variant: 'destructive'
    });
  }

  /**
   * Report error to monitoring service
   */
  private static reportError(error: AppError): void {
    // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ErrorReporting]', error);
    }
  }

  /**
   * Create retry function with exponential backoff
   */
  static createRetryHandler<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): () => Promise<T> {
    return async (): Promise<T> => {
      let lastError: any;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;
          
          // Don't retry for certain types of errors
          if (this.shouldNotRetry(error)) {
            throw error;
          }
          
          // If this was the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }
          
          // Wait before retrying with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      throw lastError;
    };
  }

  /**
   * Check if error should not be retried
   */
  private static shouldNotRetry(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    const code = error?.code;
    
    // Don't retry authentication errors
    if (code === '42501' || message.includes('permission') || message.includes('unauthorized')) {
      return true;
    }
    
    // Don't retry validation errors
    if (code === '23505' || message.includes('duplicate') || message.includes('validation')) {
      return true;
    }
    
    // Don't retry client errors (4xx)
    if (code && code.toString().startsWith('4')) {
      return true;
    }
    
    return false;
  }
}

/**
 * Hook for handling async operations with error handling
 */
export const useAsyncOperation = () => {
  const execute = async <T>(
    operation: () => Promise<T>,
    context?: string,
    showSuccessToast?: string
  ): Promise<T | null> => {
    try {
      const result = await operation();
      
      if (showSuccessToast) {
        toast({
          title: 'Suksess',
          description: showSuccessToast
        });
      }
      
      return result;
    } catch (error) {
      ErrorHandler.handle(error, context);
      return null;
    }
  };

  return { execute };
};