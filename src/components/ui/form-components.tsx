import React from 'react';
import { Label } from '@/components/ui/label';
import { FormFieldProps } from '@/types';
import { cn } from '@/lib/utils';

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  help,
  children
}) => {
  return (
    <div className="space-y-2">
      <Label className={cn(
        "text-sm font-medium",
        error && "text-destructive",
        required && "after:content-['*'] after:ml-0.5 after:text-destructive"
      )}>
        {label}
      </Label>
      {children}
      {help && !error && (
        <p className="text-xs text-muted-foreground">{help}</p>
      )}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
};

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  className
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children}
    </div>
  );
};