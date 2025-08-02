-- Drop ALL existing policies on maintenance_agreements to start fresh
DROP POLICY IF EXISTS "Admin can manage all agreements" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Admin and saksbehandler can delete agreements" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Authenticated users can create agreements" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Saksbehandler can manage agreements" ON public.maintenance_agreements;
DROP POLICY IF EXISTS "Tekniker can view own department agreements" ON public.maintenance_agreements;

-- Create simple, non-recursive policies
-- 1. Allow admins to do everything
CREATE POLICY "Admin full access" 
ON public.maintenance_agreements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 2. Allow saksbehandler to do everything
CREATE POLICY "Saksbehandler full access" 
ON public.maintenance_agreements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'saksbehandler'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'saksbehandler'
  )
);

-- 3. Allow technicians to view agreements from their department
CREATE POLICY "Technician view own department" 
ON public.maintenance_agreements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'technician'
    AND auth.users.raw_user_meta_data->>'department' = maintenance_agreements.department::text
  )
);

-- 4. Allow authenticated users to create agreements
CREATE POLICY "Users can create agreements" 
ON public.maintenance_agreements 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);