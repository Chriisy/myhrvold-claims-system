-- Drop all existing policies and create completely simple ones
DROP POLICY IF EXISTS "Admin full access" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Saksbehandler full access" ON public.maintenance_agreements; 
DROP POLICY IF EXISTS "Technician view own department" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Users can create agreements" ON public.maintenance_agreements;

-- Create very simple policies without complex conditions
-- 1. Allow all authenticated users to read maintenance agreements
CREATE POLICY "All authenticated users can view agreements" 
ON public.maintenance_agreements 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Allow all authenticated users to create agreements
CREATE POLICY "All authenticated users can create agreements" 
ON public.maintenance_agreements 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Allow all authenticated users to update agreements
CREATE POLICY "All authenticated users can update agreements" 
ON public.maintenance_agreements 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- 4. Allow all authenticated users to delete agreements  
CREATE POLICY "All authenticated users can delete agreements" 
ON public.maintenance_agreements 
FOR DELETE 
USING (auth.uid() IS NOT NULL);