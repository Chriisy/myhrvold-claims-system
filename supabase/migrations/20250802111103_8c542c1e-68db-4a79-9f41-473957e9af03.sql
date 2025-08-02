-- Fix infinite recursion in maintenance_agreements RLS policies
-- Drop the problematic policy
DROP POLICY IF EXISTS "Tekniker can view own department agreements" ON public.maintenance_agreements;

-- Create a simpler policy that doesn't cause recursion
-- Use auth.uid() directly and avoid complex subqueries
CREATE POLICY "Tekniker can view own department agreements" 
ON public.maintenance_agreements 
FOR SELECT 
USING (
  -- Admin and saksbehandler can see all
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'saksbehandler')
  )
  OR
  -- Technicians can see agreements from their department
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'technician'
    AND profiles.department = maintenance_agreements.department
  )
  OR
  -- Technicians can see agreements where they have visits
  EXISTS (
    SELECT 1 FROM public.service_visits sv 
    WHERE sv.avtale_id = maintenance_agreements.id 
    AND sv.tekniker_id = auth.uid()
  )
);