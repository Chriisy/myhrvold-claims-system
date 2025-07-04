import { useToast as useToastOriginal } from '@/hooks/use-toast';

// Enhanced toast hook with predefined message types
export const useEnhancedToast = () => {
  const { toast } = useToastOriginal();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "default",
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  };

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
    });
  };

  const showLoading = (title: string, description?: string) => {
    return toast({
      title,
      description,
      duration: Infinity, // Keep loading toasts until manually dismissed
    });
  };

  const showValidationError = (errors: string[]) => {
    toast({
      title: "Valideringsfeil",
      description: errors.join(", "),
      variant: "destructive",
    });
  };

  const showNetworkError = () => {
    toast({
      title: "Nettverksfeil",
      description: "Sjekk internettforbindelsen og prøv igjen",
      variant: "destructive",
    });
  };

  const showUnexpectedError = () => {
    toast({
      title: "Uventet feil",
      description: "Noe gikk galt. Prøv igjen senere.",
      variant: "destructive",
    });
  };

  return {
    toast, // Original toast function
    showSuccess,
    showError,
    showInfo,
    showLoading,
    showValidationError,
    showNetworkError,
    showUnexpectedError,
  };
};