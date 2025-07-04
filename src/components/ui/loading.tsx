import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingState = ({ 
  isLoading, 
  children, 
  loadingText = "Laster...",
  className 
}: LoadingStateProps) => {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface PageLoadingProps {
  text?: string;
}

export const PageLoading = ({ text = "Laster side..." }: PageLoadingProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};

interface ButtonLoadingProps {
  isLoading: boolean;
  children: ReactNode;
  loadingText?: string;
}

export const ButtonLoading = ({ 
  isLoading, 
  children, 
  loadingText 
}: ButtonLoadingProps) => {
  return (
    <>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {isLoading ? loadingText : children}
    </>
  );
};