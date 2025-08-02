-- Enable maintenance module
UPDATE public.feature_flags 
SET enabled = true 
WHERE name = 'maintenance_enabled';