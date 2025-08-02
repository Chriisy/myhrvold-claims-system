-- Add tekniker_id field to maintenance_agreements table
ALTER TABLE public.maintenance_agreements 
ADD COLUMN tekniker_id UUID REFERENCES auth.users(id);

-- Add index for better performance
CREATE INDEX idx_maintenance_agreements_tekniker_id ON public.maintenance_agreements(tekniker_id);