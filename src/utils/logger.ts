/**
 * Production-ready logging utility
 * Replaces console.log statements with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      const entry = this.formatMessage('debug', message, context);
      console.debug(`[DEBUG] ${entry.timestamp}: ${message}`, context);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.info(`[INFO] ${entry.timestamp}: ${message}`, context);
    }
    // In production, could send to logging service
  }

  warn(message: string, context?: Record<string, any>): void {
    const entry = this.formatMessage('warn', message, context);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${entry.timestamp}: ${message}`, context);
    }
    // In production, could send to logging service
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    const entry = this.formatMessage('error', message, context);
    entry.error = error;
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${entry.timestamp}: ${message}`, error, context);
    }
    
    // In production, always log errors (could send to error reporting service)
    // For now, we'll use console.error as fallback but in structured format
    if (!this.isDevelopment) {
      console.error(JSON.stringify(entry));
    }
  }
}

export const logger = new Logger();