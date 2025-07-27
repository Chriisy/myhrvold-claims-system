import { useToast } from '@/hooks/use-toast';
import { useCallback } from 'react';

export type ToastVariant = "default" | "destructive" | "success" | "warning";

interface EnhancedToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Enhanced toast hook with predefined message types
export const useEnhancedToast = () => {
  const { toast } = useToast();

  const showToast = useCallback((options: EnhancedToastOptions) => {
    const { title, description, variant = "default", duration = 4000, action } = options;

    toast({
      title,
      description,
      variant: variant === "success" ? "default" : variant === "warning" ? "destructive" : variant,
      duration,
      // Skip action for now as it requires a custom component
    });
  }, [toast]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "success",
    });
  }, [showToast]);

  const showError = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "destructive",
    });
  }, [showToast]);

  const showInfo = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      variant: "default",
    });
  }, [showToast]);

  const showLoading = useCallback((title: string, description?: string) => {
    return toast({
      title,
      description,
      duration: Infinity, // Keep loading toasts until manually dismissed
    });
  }, [toast]);

  const showValidationError = useCallback((errors: string[]) => {
    showToast({
      title: "Valideringsfeil",
      description: errors.join(", "),
      variant: "destructive",
    });
  }, [showToast]);

  const showNetworkError = useCallback(() => {
    showToast({
      title: "Nettverksfeil",
      description: "Sjekk internettforbindelsen og prøv igjen",
      variant: "destructive",
    });
  }, [showToast]);

  const showUnexpectedError = useCallback(() => {
    showToast({
      title: "Uventet feil",
      description: "Noe gikk galt. Prøv igjen senere.",
      variant: "destructive",
    });
  }, [showToast]);

  return {
    toast, // Original toast function
    showToast,
    showSuccess,
    showError,
    showInfo,
    showLoading,
    showValidationError,
    showNetworkError,
    showUnexpectedError,
  };
};