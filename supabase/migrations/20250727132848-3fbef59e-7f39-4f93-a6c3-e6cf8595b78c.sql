-- Create error_logs table for production logging
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  error_context JSONB DEFAULT '{}'::jsonb,
  url TEXT,
  user_agent TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only admins can view error logs" 
ON public.error_logs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can create error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update error logs" 
ON public.error_logs 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_error_logs_updated_at
BEFORE UPDATE ON public.error_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_date();

-- Create index for performance
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);