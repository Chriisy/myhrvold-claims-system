-- Fix security linter issues

-- Fix function search path for existing functions
CREATE OR REPLACE FUNCTION public.update_maintenance_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_agreement_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
    -- Generate agreement number if not provided
    IF NEW.avtale_nummer IS NULL OR NEW.avtale_nummer = '' THEN
        NEW.avtale_nummer := public.generate_agreement_number();
    END IF;
    
    RETURN NEW;
END;
$$;

-- Enable RLS on feature_flags table (this was missing)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for feature_flags
CREATE POLICY "Everyone can read feature flags" 
ON public.feature_flags FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage feature flags" 
ON public.feature_flags FOR ALL 
USING (get_current_user_role() = 'admin');