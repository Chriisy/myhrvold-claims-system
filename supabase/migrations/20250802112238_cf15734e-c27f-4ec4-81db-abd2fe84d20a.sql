-- Fix RLS policies to use existing get_current_user_role function instead of auth.users
-- Drop all policies first
DROP POLICY IF EXISTS "Admin full access" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Saksbehandler full access" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Technician view own department" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Users can create agreements" ON public.maintenance_agreements;

-- Create new policies using the existing get_current_user_role function
-- 1. Allow admins to do everything
CREATE POLICY "Admin full access" 
ON public.maintenance_agreements 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Allow saksbehandler to do everything  
CREATE POLICY "Saksbehandler full access" 
ON public.maintenance_agreements 
FOR ALL 
USING (get_current_user_role() = 'saksbehandler')
WITH CHECK (get_current_user_role() = 'saksbehandler');

-- 3. Allow technicians to view agreements from their department
CREATE POLICY "Technician view own department" 
ON public.maintenance_agreements 
FOR SELECT 
USING (
  get_current_user_role() = 'technician' 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.department = maintenance_agreements.department
  )
);

-- 4. Allow authenticated users to create agreements
CREATE POLICY "Users can create agreements" 
ON public.maintenance_agreements 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);