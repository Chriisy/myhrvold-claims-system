-- Create budget_targets table for tracking annual refund goals
CREATE TABLE public.budget_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year INTEGER NOT NULL,
  target_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  department department NULL, -- Optional department-specific goals
  supplier_name TEXT NULL, -- Optional supplier-specific goals
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID NULL REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  
  -- Constraints
  CONSTRAINT budget_targets_year_check CHECK (year >= 2020 AND year <= 2050),
  CONSTRAINT budget_targets_amount_check CHECK (target_amount >= 0),
  
  -- Unique constraint: one general goal per year, one per department per year, one per supplier per year
  CONSTRAINT budget_targets_unique_general UNIQUE (year) WHERE department IS NULL AND supplier_name IS NULL,
  CONSTRAINT budget_targets_unique_department UNIQUE (year, department) WHERE supplier_name IS NULL,
  CONSTRAINT budget_targets_unique_supplier UNIQUE (year, supplier_name) WHERE department IS NULL
);

-- Enable RLS
ALTER TABLE public.budget_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage all budget targets" 
ON public.budget_targets 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Users can view budget targets" 
ON public.budget_targets 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_budget_targets_updated_at
BEFORE UPDATE ON public.budget_targets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_date();

-- Create function to get budget progress
CREATE OR REPLACE FUNCTION public.get_budget_progress(
  p_year INTEGER,
  p_department department DEFAULT NULL,
  p_supplier_name TEXT DEFAULT NULL
)
RETURNS TABLE(
  target_amount NUMERIC,
  actual_refunded NUMERIC,
  progress_percentage NUMERIC,
  remaining_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  target_amt NUMERIC := 0;
  actual_amt NUMERIC := 0;
BEGIN
  -- Get target amount
  SELECT bt.target_amount INTO target_amt
  FROM public.budget_targets bt
  WHERE bt.year = p_year
    AND (p_department IS NULL OR bt.department = p_department)
    AND (p_supplier_name IS NULL OR bt.supplier_name = p_supplier_name)
    AND (
      (p_department IS NULL AND p_supplier_name IS NULL AND bt.department IS NULL AND bt.supplier_name IS NULL) OR
      (p_department IS NOT NULL AND p_supplier_name IS NULL AND bt.department = p_department AND bt.supplier_name IS NULL) OR
      (p_supplier_name IS NOT NULL AND p_department IS NULL AND bt.supplier_name = p_supplier_name AND bt.department IS NULL)
    );

  -- Get actual refunded amount for the year
  SELECT COALESCE(SUM(c.total_refunded), 0) INTO actual_amt
  FROM public.claims c
  WHERE EXTRACT(YEAR FROM c.refund_date_received) = p_year
    AND c.total_refunded > 0
    AND (p_department IS NULL OR c.department = p_department)
    AND (p_supplier_name IS NULL OR c.supplier = p_supplier_name);

  -- Return results
  RETURN QUERY SELECT 
    COALESCE(target_amt, 0) as target_amount,
    actual_amt as actual_refunded,
    CASE 
      WHEN target_amt > 0 THEN ROUND((actual_amt / target_amt) * 100, 2)
      ELSE 0
    END as progress_percentage,
    GREATEST(COALESCE(target_amt, 0) - actual_amt, 0) as remaining_amount;
END;
$$;