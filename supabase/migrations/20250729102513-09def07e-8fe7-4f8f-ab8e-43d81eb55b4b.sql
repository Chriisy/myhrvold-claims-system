-- Add supplier reference number field to claims table
ALTER TABLE public.claims 
ADD COLUMN supplier_reference_number text;