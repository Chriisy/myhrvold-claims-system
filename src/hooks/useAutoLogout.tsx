import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useOptimizedAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TIMEOUT_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes before logout warning

export const useAutoLogout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const cleanupAuthState = useCallback(() => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  const performLogout = useCallback(async () => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      toast({
        title: "Automatisk utlogget",
        description: "Du har blitt logget ut etter 2 timer med inaktivitet.",
        variant: "destructive",
      });
      
      // Force page reload to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during auto logout:', error);
      window.location.href = '/auth';
    }
  }, [cleanupAuthState, toast]);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Du vil snart bli logget ut",
        description: "Du blir automatisk logget ut om 5 minutter på grunn av inaktivitet. Klikk hvor som helst for å forbli innlogget.",
        duration: 10000, // Show for 10 seconds
      });
    }
  }, [toast]);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Reset warning flag
    warningShownRef.current = false;

    // Only set timers if user is logged in
    if (user) {
      // Set warning timer (2 hours - 5 minutes)
      warningRef.current = setTimeout(() => {
        showWarning();
      }, TIMEOUT_DURATION - WARNING_DURATION);

      // Set logout timer (2 hours)
      timeoutRef.current = setTimeout(() => {
        performLogout();
      }, TIMEOUT_DURATION);
    }
  }, [user, showWarning, performLogout]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimers();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Start initial timer
    resetTimers();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [user, resetTimers]);

  // Clear timers when user logs out
  useEffect(() => {
    if (!user) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      warningShownRef.current = false;
    }
  }, [user]);
};