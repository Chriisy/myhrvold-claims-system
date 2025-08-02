-- Update RLS policies for maintenance agreements to respect department access
DROP POLICY IF EXISTS "Tekniker can view agreements for their visits" ON public.maintenance_agreements;

-- Tekniker can only view agreements from their own department or those they have visits for
CREATE POLICY "Tekniker can view own department agreements" 
ON public.maintenance_agreements 
FOR SELECT 
USING (
  get_current_user_role() = 'admin'::text 
  OR get_current_user_role() = 'saksbehandler'::text
  OR (
    get_current_user_role() = 'technician'::text 
    AND (
      department = (SELECT department FROM public.profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM service_visits sv 
        WHERE sv.avtale_id = maintenance_agreements.id 
        AND sv.tekniker_id = auth.uid()
      )
    )
  )
);

-- Update service visits RLS to respect department access
DROP POLICY IF EXISTS "Tekniker can view their own visits" ON public.service_visits;

CREATE POLICY "Tekniker can view own department visits" 
ON public.service_visits 
FOR SELECT 
USING (
  get_current_user_role() = 'admin'::text 
  OR (
    get_current_user_role() = 'technician'::text 
    AND (
      tekniker_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM maintenance_agreements ma 
        WHERE ma.id = service_visits.avtale_id 
        AND ma.department = (SELECT department FROM public.profiles WHERE id = auth.uid())
      )
    )
  )
);

-- Add delete policy for maintenance agreements (admin and saksbehandler only)
CREATE POLICY "Admin and saksbehandler can delete agreements" 
ON public.maintenance_agreements 
FOR DELETE 
USING (
  get_current_user_role() = 'admin'::text 
  OR get_current_user_role() = 'saksbehandler'::text
);