-- Fix RLS policies for maintenance_agreements table

-- First, drop the existing problematic policy
DROP POLICY IF EXISTS "Tekniker can view agreements for their visits" ON maintenance_agreements;

-- Create corrected policies
CREATE POLICY "Tekniker can view agreements for their visits" 
ON maintenance_agreements 
FOR SELECT 
USING (
  (get_current_user_role() = 'admin'::text) OR 
  (
    (get_current_user_role() = 'technician'::text) AND 
    (EXISTS (
      SELECT 1 
      FROM service_visits sv 
      WHERE sv.avtale_id = maintenance_agreements.id 
      AND sv.tekniker_id = auth.uid()
    ))
  )
);

-- Ensure saksbehandler role can also manage agreements
CREATE POLICY "Saksbehandler can manage agreements" 
ON maintenance_agreements 
FOR ALL 
USING (get_current_user_role() = 'saksbehandler'::text);

-- Add specific INSERT policy for creating new agreements
CREATE POLICY "Authenticated users can create agreements" 
ON maintenance_agreements 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);