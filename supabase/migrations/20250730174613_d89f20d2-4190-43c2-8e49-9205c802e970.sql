-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_budget_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on budget_targets
DROP TRIGGER IF EXISTS update_budget_targets_updated_at_trigger ON public.budget_targets;
CREATE TRIGGER update_budget_targets_updated_at_trigger
  BEFORE UPDATE ON public.budget_targets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_budget_targets_updated_at();