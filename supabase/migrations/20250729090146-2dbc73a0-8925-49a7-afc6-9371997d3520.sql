-- Fix security warnings: Add search_path to all database functions
-- This prevents SQL injection and ensures secure function execution

-- Fix generate_claim_number function
CREATE OR REPLACE FUNCTION public.generate_claim_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  claim_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(RIGHT(c.claim_number, 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.claims c
  WHERE c.claim_number LIKE 'RK-' || current_year || '-%';
  
  claim_number := 'RK-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
  RETURN claim_number;
END;
$function$;

-- Fix generate_account_code function
CREATE OR REPLACE FUNCTION public.generate_account_code(p_issue_type public.issue_type, p_product_name text, p_customer_name text)
 RETURNS TABLE(account_code text, account_string text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  code TEXT;
BEGIN
  -- Norwegian accounting codes based on business requirements
  CASE p_issue_type
    WHEN 'service_callback' THEN code := '4506'; -- Intern service reklamasjon + GW
    WHEN 'warranty' THEN code := '7550'; -- Ekstern garantikostnad
    WHEN 'claim' THEN code := '7555'; -- Intern garantikostnad  
    WHEN 'extended_warranty' THEN code := '7566'; -- Utvidet garanti
    ELSE code := '7550'; -- Default to warranty
  END CASE;
  
  -- Return both code and formatted account string
  RETURN QUERY SELECT 
    code, 
    code || ';' || p_product_name || ';' || p_customer_name;
END;
$function$;

-- Fix auto_generate_claim_fields function
CREATE OR REPLACE FUNCTION public.auto_generate_claim_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  acc_code TEXT;
  acc_string TEXT;
BEGIN
  -- Generate claim number if not provided
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := public.generate_claim_number();
  END IF;
  
  -- Generate account code and string
  SELECT ac.account_code, ac.account_string
  INTO acc_code, acc_string
  FROM public.generate_account_code(NEW.issue_type, NEW.product_name, NEW.customer_name) ac;
  
  NEW.account_code := acc_code;
  NEW.account_string := acc_string;
  
  RETURN NEW;
END;
$function$;

-- Fix get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
 RETURNS text
 LANGUAGE sql
 STABLE 
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- Fix handle_claim_status_change function
CREATE OR REPLACE FUNCTION public.handle_claim_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  admin_user RECORD;
BEGIN
  -- Only proceed if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Create notification based on status change
  CASE NEW.status
    WHEN 'pending_approval' THEN
      notification_title := 'Reklamasjon venter på godkjenning';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er klar for godkjenning.';
      
      -- Notify all admins
      FOR admin_user IN 
        SELECT id FROM public.profiles WHERE role = 'admin' AND is_active = true
      LOOP
        PERFORM public.create_notification(
          admin_user.id,
          NEW.id,
          'approval_needed',
          notification_title,
          notification_message
        );
      END LOOP;
      
    WHEN 'under_processing' THEN
      notification_title := 'Reklamasjon under behandling';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er nå under behandling.';
      
      -- Notify claim creator
      PERFORM public.create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
      
    WHEN 'sent_supplier' THEN
      notification_title := 'Reklamasjon sendt til leverandør';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er sendt til ' || NEW.supplier || '.';
      
      -- Notify claim creator and set reminder for 7 days
      PERFORM public.create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
      
      PERFORM public.create_notification(
        NEW.created_by,
        NEW.id,
        'reminder',
        'Påminnelse: Venter på svar fra leverandør',
        'Reklamasjon ' || NEW.claim_number || ' har ventet på svar fra ' || NEW.supplier || ' i 7 dager.',
        now() + interval '7 days'
      );
      
    WHEN 'resolved' THEN
      notification_title := 'Reklamasjon løst';
      notification_message := 'Reklamasjon ' || NEW.claim_number || ' er nå løst.';
      
      -- Notify claim creator
      PERFORM public.create_notification(
        NEW.created_by,
        NEW.id,
        'status_change',
        notification_title,
        notification_message
      );
  END CASE;
  
  RETURN NEW;
END;
$function$;

-- Fix check_overdue_claims function
CREATE OR REPLACE FUNCTION public.check_overdue_claims()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  overdue_claim RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Find claims that are overdue (sent to supplier more than 14 days ago without response)
  FOR overdue_claim IN 
    SELECT c.*, p.id as creator_id
    FROM public.claims c
    JOIN public.profiles p ON p.id = c.created_by
    WHERE c.status = 'sent_supplier' 
      AND c.supplier_email_sent_date < now() - interval '14 days'
      AND c.supplier_response_date IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.notifications n 
        WHERE n.claim_id = c.id 
          AND n.type = 'overdue' 
          AND n.created_at > now() - interval '7 days'
      )
  LOOP
    notification_title := 'Reklamasjon forfalt';
    notification_message := 'Reklamasjon ' || overdue_claim.claim_number || 
                           ' har ikke fått svar fra ' || overdue_claim.supplier || 
                           ' på over 14 dager.';
    
    -- Notify claim creator
    PERFORM public.create_notification(
      overdue_claim.creator_id,
      overdue_claim.id,
      'overdue',
      notification_title,
      notification_message
    );
  END LOOP;
END;
$function$;

-- Fix create_notification function
CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_claim_id uuid, p_type text, p_title text, p_message text, p_scheduled_for timestamp with time zone DEFAULT NULL::timestamp with time zone, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, claim_id, type, title, message, scheduled_for, metadata
  ) VALUES (
    p_user_id, p_claim_id, p_type, p_title, p_message, p_scheduled_for, p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::public.user_role
      ELSE 'technician'::public.user_role
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'department' = 'oslo' THEN 'oslo'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'bergen' THEN 'bergen'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'trondheim' THEN 'trondheim'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'stavanger' THEN 'stavanger'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'kristiansand' THEN 'kristiansand'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'nord_norge' THEN 'nord_norge'::public.department
      WHEN NEW.raw_user_meta_data->>'department' = 'innlandet' THEN 'innlandet'::public.department
      ELSE 'oslo'::public.department
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return NEW
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error and still return NEW to allow user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Fix update_updated_date function
CREATE OR REPLACE FUNCTION public.update_updated_date()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_date := now();
  RETURN NEW;
END;
$function$;