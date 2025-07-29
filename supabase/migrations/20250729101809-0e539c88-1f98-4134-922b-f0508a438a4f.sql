-- Create GDPR compliance tables

-- Audit log for GDPR compliance
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'SELECT'
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User consent tracking
CREATE TABLE public.user_consent (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL, -- 'cookies', 'data_processing', 'marketing'
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  withdrawn_date TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, consent_type)
);

-- Data retention policies
CREATE TABLE public.data_retention_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  auto_delete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit_logs
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can create audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for user_consent
CREATE POLICY "Users can manage their own consent" 
ON public.user_consent 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all consent" 
ON public.user_consent 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS policies for data_retention_policies
CREATE POLICY "Admins can manage retention policies" 
ON public.data_retention_policies 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Insert default retention policies
INSERT INTO public.data_retention_policies (table_name, retention_days, auto_delete) VALUES
('claims', 2555, false), -- 7 years for financial records
('error_logs', 365, true), -- 1 year for error logs
('notifications', 90, true), -- 3 months for notifications
('ocr_analytics', 730, false); -- 2 years for analytics

-- Function to log data access for GDPR audit
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_table_name TEXT,
  p_operation TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, table_name, operation, record_id, old_values, new_values, ip_address
  ) VALUES (
    auth.uid(), p_table_name, p_operation, p_record_id, p_old_values, p_new_values, 
    inet_client_addr()
  ) RETURNING id INTO audit_id;
  
  RETURN audit_id;
END;
$$;

-- Function to anonymize user data (GDPR right to be forgotten)
CREATE OR REPLACE FUNCTION public.anonymize_user_data(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  anonymized_email TEXT;
BEGIN
  -- Check if user exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RETURN false;
  END IF;
  
  -- Generate anonymized email
  anonymized_email := 'anonymized_' || p_user_id || '@deleted.user';
  
  -- Anonymize profile data
  UPDATE public.profiles 
  SET 
    email = anonymized_email,
    full_name = 'Anonymized User',
    phone = NULL
  WHERE id = p_user_id;
  
  -- Anonymize claims data (keep business data but remove personal info)
  UPDATE public.claims 
  SET 
    customer_name = 'Anonymized Customer',
    customer_contact = NULL,
    customer_email = NULL,
    customer_phone = NULL,
    customer_address = 'Anonymized Address'
  WHERE created_by = p_user_id;
  
  -- Log the anonymization
  PERFORM public.log_data_access('profiles', 'ANONYMIZE', p_user_id);
  
  RETURN true;
END;
$$;

-- Function to export user data (GDPR right to data portability)
CREATE OR REPLACE FUNCTION public.export_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_data JSONB;
  claims_data JSONB;
  consent_data JSONB;
BEGIN
  -- Check if requesting own data or admin
  IF auth.uid() != p_user_id AND get_current_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get profile data
  SELECT to_jsonb(profiles) INTO user_data
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Get claims data
  SELECT jsonb_agg(to_jsonb(claims)) INTO claims_data
  FROM public.claims 
  WHERE created_by = p_user_id;
  
  -- Get consent data
  SELECT jsonb_agg(to_jsonb(user_consent)) INTO consent_data
  FROM public.user_consent 
  WHERE user_id = p_user_id;
  
  -- Log the data export
  PERFORM public.log_data_access('profiles', 'EXPORT', p_user_id);
  
  RETURN jsonb_build_object(
    'profile', user_data,
    'claims', COALESCE(claims_data, '[]'::jsonb),
    'consent', COALESCE(consent_data, '[]'::jsonb),
    'exported_at', now()
  );
END;
$$;