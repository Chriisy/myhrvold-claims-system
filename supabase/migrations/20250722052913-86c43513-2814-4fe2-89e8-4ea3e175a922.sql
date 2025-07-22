-- Fix ambiguous column reference in generate_claim_number function
CREATE OR REPLACE FUNCTION public.generate_claim_number()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  claim_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(RIGHT(c.claim_number, 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM claims c
  WHERE c.claim_number LIKE 'RK-' || current_year || '-%';
  
  claim_number := 'RK-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
  RETURN claim_number;
END;
$function$;