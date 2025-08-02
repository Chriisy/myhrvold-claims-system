-- Add customer number field to maintenance_agreements table
ALTER TABLE public.maintenance_agreements 
ADD COLUMN kunde_nummer text;

-- Add a helpful comment
COMMENT ON COLUMN public.maintenance_agreements.kunde_nummer IS 'Customer number for the maintenance agreement';

-- Also add images field to store uploaded images
ALTER TABLE public.maintenance_agreements 
ADD COLUMN bilder jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.maintenance_agreements.bilder IS 'Array of image URLs uploaded for this maintenance agreement';