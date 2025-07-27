import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: string;
  sessionId?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

interface ErrorLog {
  id?: string;
  error_message: string;
  error_stack?: string;
  error_type: 'javascript' | 'network' | 'authentication' | 'validation' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: ErrorContext;
  created_at?: string;
  user_id?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private isOnline: boolean = navigator.onLine;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupOnlineListener();
    this.setupUnhandledRejectionListener();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupUnhandledRejectionListener(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        'critical',
        'javascript',
        { action: 'unhandled_promise_rejection' }
      );
    });
  }

  private async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  }

  private createErrorContext(additionalData?: Record<string, any>): ErrorContext {
    return {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      ...additionalData,
    };
  }

  async logError(
    error: Error | string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    type: 'javascript' | 'network' | 'authentication' | 'validation' | 'database',
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      const context = this.createErrorContext(additionalData);

      const errorLog: ErrorLog = {
        error_message: error instanceof Error ? error.message : String(error),
        error_stack: error instanceof Error ? error.stack : undefined,
        error_type: type,
        severity,
        context: {
          ...context,
          userId: user?.id,
        },
        user_id: user?.id,
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 ${severity.toUpperCase()} Error Logged`);
        console.error('Error:', error);
        console.log('Context:', context);
        console.log('User:', user?.email || 'Anonymous');
        console.groupEnd();
      }

      if (this.isOnline) {
        await this.sendErrorToDatabase(errorLog);
      } else {
        this.errorQueue.push(errorLog);
        this.saveErrorsToLocalStorage();
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
      // Fallback: save to localStorage if database logging fails
      this.errorQueue.push({
        error_message: error instanceof Error ? error.message : String(error),
        error_type: type,
        severity,
        context: this.createErrorContext(additionalData),
      });
      this.saveErrorsToLocalStorage();
    }
  }

  private async sendErrorToDatabase(errorLog: ErrorLog): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Send to Supabase error_logs table
      const { error } = await supabase.from('error_logs').insert({
        user_id: user?.id || null,
        error_message: errorLog.error_message,
        error_stack: errorLog.error_stack,
        error_context: errorLog.context as any, // Cast to bypass JSON type check
        url: errorLog.context.url,
        user_agent: errorLog.context.userAgent,
        severity: errorLog.severity,
      });

      if (error) {
        console.error('Failed to log error to database:', error);
        // Fallback to localStorage
        this.saveToLocalStorage(errorLog);
      }
    } catch (err) {
      console.error('Error logging to database:', err);
      // Fallback to localStorage
      this.saveToLocalStorage(errorLog);
    }
  }

  private saveToLocalStorage(errorLog: ErrorLog): void {
    // Store in localStorage for later analysis
    const existingLogs = JSON.parse(localStorage.getItem('myhrvold_error_logs') || '[]');
    existingLogs.push(errorLog);
    
    // Keep only last 100 errors
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('myhrvold_error_logs', JSON.stringify(existingLogs));
  }

  private saveErrorsToLocalStorage(): void {
    try {
      localStorage.setItem('myhrvold_error_queue', JSON.stringify(this.errorQueue));
    } catch (error) {
      console.error('Failed to save errors to localStorage:', error);
    }
  }

  private loadErrorsFromLocalStorage(): void {
    try {
      const savedErrors = localStorage.getItem('myhrvold_error_queue');
      if (savedErrors) {
        this.errorQueue = JSON.parse(savedErrors);
      }
    } catch (error) {
      console.error('Failed to load errors from localStorage:', error);
      this.errorQueue = [];
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      for (const errorLog of errorsToSend) {
        await this.sendErrorToDatabase(errorLog);
      }
      
      // Clear localStorage after successful flush
      localStorage.removeItem('myhrvold_error_queue');
    } catch (error) {
      // If flushing fails, restore the errors to queue
      this.errorQueue = [...errorsToSend, ...this.errorQueue];
      this.saveErrorsToLocalStorage();
      console.error('Failed to flush error queue:', error);
    }
  }

  // Utility methods for specific error types
  logNetworkError(error: Error, url: string, method: string): void {
    this.logError(error, 'high', 'network', { 
      url, 
      method, 
      action: 'network_request_failed' 
    });
  }

  logAuthenticationError(error: Error, action: string): void {
    this.logError(error, 'high', 'authentication', { 
      action: `auth_${action}` 
    });
  }

  logValidationError(error: Error, formName: string, field?: string): void {
    this.logError(error, 'medium', 'validation', { 
      formName, 
      field, 
      action: 'form_validation_failed' 
    });
  }

  logDatabaseError(error: Error, operation: string, table?: string): void {
    this.logError(error, 'high', 'database', { 
      operation, 
      table, 
      action: 'database_operation_failed' 
    });
  }

  logComponentError(error: Error, componentName: string, props?: Record<string, any>): void {
    this.logError(error, 'high', 'javascript', { 
      component: componentName, 
      props, 
      action: 'component_render_failed' 
    });
  }
}

// Singleton instance
export const errorLogger = ErrorLogger.getInstance();

// Convenience functions
export const logError = (
  error: Error | string, 
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  type: 'javascript' | 'network' | 'authentication' | 'validation' | 'database' = 'javascript',
  additionalData?: Record<string, any>
) => errorLogger.logError(error, severity, type, additionalData);

export const logNetworkError = (error: Error, url: string, method: string) => 
  errorLogger.logNetworkError(error, url, method);

export const logAuthError = (error: Error, action: string) => 
  errorLogger.logAuthenticationError(error, action);

export const logValidationError = (error: Error, formName: string, field?: string) => 
  errorLogger.logValidationError(error, formName, field);

export const logDatabaseError = (error: Error, operation: string, table?: string) => 
  errorLogger.logDatabaseError(error, operation, table);

export const logComponentError = (error: Error, componentName: string, props?: Record<string, any>) => 
  errorLogger.logComponentError(error, componentName, props);