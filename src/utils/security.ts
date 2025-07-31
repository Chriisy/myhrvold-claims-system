/**
 * Security utilities for input validation and sanitization
 */

// Email validation regex - more strict
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Strong password requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for now
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Passord er påkrevd');
    return { isValid: false, errors };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Passord må være minst ${PASSWORD_REQUIREMENTS.minLength} tegn`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Passord må inneholde minst én stor bokstav');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Passord må inneholde minst én liten bokstav');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Passord må inneholde minst ett tall');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Passord må inneholde minst ett spesialtegn');
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Sanitizes user input by removing dangerous characters
 */
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
};

/**
 * Validates Norwegian names (allows Norwegian characters)
 */
export const validateNorwegianName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const nameRegex = /^[a-zA-ZæøåÆØÅ\s\-'\.]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Sanitizes and validates phone numbers
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return true; // Optional field
  
  // Norwegian phone number patterns
  const phoneRegex = /^(\+47|0047|47)?[2-9]\d{7}$/;
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Validates Norwegian postal codes
 */
export const validatePostalCode = (postalCode: string): boolean => {
  if (!postalCode || typeof postalCode !== 'string') return true; // Optional field
  
  const postalRegex = /^\d{4}$/;
  return postalRegex.test(postalCode.trim());
};

/**
 * Validates organization numbers (Norwegian)
 */
export const validateOrgNumber = (orgNumber: string): boolean => {
  if (!orgNumber || typeof orgNumber !== 'string') return true; // Optional field
  
  const orgRegex = /^\d{9}$/;
  return orgRegex.test(orgNumber.replace(/\s/g, ''));
};

/**
 * Rate limiting helper for client-side
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Clean old attempts
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    this.attempts.set(identifier, recentAttempts);
    
    return recentAttempts.length >= this.maxAttempts;
  }

  recordAttempt(identifier: string): void {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    attempts.push(now);
    this.attempts.set(identifier, attempts);
  }
}

/**
 * Creates a secure authentication rate limiter
 */
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes