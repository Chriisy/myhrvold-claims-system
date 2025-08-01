-- Fix the search path security issue in the log_claim_changes function
CREATE OR REPLACE FUNCTION public.log_claim_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  action_text TEXT;
BEGIN
  -- Get user's full name
  SELECT full_name INTO user_name
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Determine action based on operation
  IF TG_OP = 'INSERT' THEN
    action_text := 'Reklamasjon opprettet';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Check what changed and create specific action text
    IF OLD.status != NEW.status THEN
      action_text := 'Status endret fra "' || 
        CASE OLD.status
          WHEN 'new' THEN 'Ny'
          WHEN 'pending_approval' THEN 'Venter på godkjenning'
          WHEN 'under_processing' THEN 'Under behandling'
          WHEN 'sent_supplier' THEN 'Sendt til leverandør'
          WHEN 'awaiting_response' THEN 'Venter på svar'
          WHEN 'resolved' THEN 'Løst'
          WHEN 'rejected' THEN 'Avvist'
          ELSE OLD.status::TEXT
        END || '" til "' ||
        CASE NEW.status
          WHEN 'new' THEN 'Ny'
          WHEN 'pending_approval' THEN 'Venter på godkjenning'
          WHEN 'under_processing' THEN 'Under behandling'
          WHEN 'sent_supplier' THEN 'Sendt til leverandør'
          WHEN 'awaiting_response' THEN 'Venter på svar'
          WHEN 'resolved' THEN 'Løst'
          WHEN 'rejected' THEN 'Avvist'
          ELSE NEW.status::TEXT
        END || '"';
    ELSIF OLD.technician_name != NEW.technician_name THEN
      action_text := 'Tekniker endret til ' || NEW.technician_name;
    ELSIF OLD.assigned_admin != NEW.assigned_admin THEN
      action_text := 'Tildelt ny administrator';
    ELSIF OLD.supplier_email_sent_date IS NULL AND NEW.supplier_email_sent_date IS NOT NULL THEN
      action_text := 'E-post sendt til leverandør (' || NEW.supplier || ')';
    ELSIF OLD.supplier_response_date IS NULL AND NEW.supplier_response_date IS NOT NULL THEN
      action_text := 'Svar mottatt fra leverandør';
    ELSIF OLD.total_refunded != NEW.total_refunded OR (OLD.total_refunded IS NULL AND NEW.total_refunded IS NOT NULL) THEN
      action_text := 'Refundering oppdatert: ' || COALESCE(NEW.total_refunded::TEXT, '0') || ' kr';
    ELSIF OLD.refund_date_received IS NULL AND NEW.refund_date_received IS NOT NULL THEN
      action_text := 'Refundering mottatt';
    ELSIF OLD.solution_description != NEW.solution_description OR (OLD.solution_description IS NULL AND NEW.solution_description IS NOT NULL) THEN
      action_text := 'Løsningsbeskrivelse oppdatert';
    ELSIF OLD.internal_notes != NEW.internal_notes OR (OLD.internal_notes IS NULL AND NEW.internal_notes IS NOT NULL) THEN
      action_text := 'Interne notater oppdatert';
    ELSIF OLD.customer_notes != NEW.customer_notes OR (OLD.customer_notes IS NULL AND NEW.customer_notes IS NOT NULL) THEN
      action_text := 'Kundenotater oppdatert';
    ELSIF OLD.supplier_notes != NEW.supplier_notes OR (OLD.supplier_notes IS NULL AND NEW.supplier_notes IS NOT NULL) THEN
      action_text := 'Leverandørnotater oppdatert';
    ELSE
      action_text := 'Reklamasjon oppdatert';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'Reklamasjon slettet';
  END IF;
  
  -- Insert timeline entry for INSERT and UPDATE operations
  IF TG_OP != 'DELETE' THEN
    INSERT INTO public.claim_timeline (
      claim_id,
      status,
      changed_by,
      changed_date,
      notes
    ) VALUES (
      NEW.id,
      NEW.status,
      auth.uid(),
      now(),
      action_text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';