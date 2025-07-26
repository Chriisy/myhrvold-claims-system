-- Add solution fields to claims table
ALTER TABLE public.claims 
ADD COLUMN solution_description TEXT,
ADD COLUMN solution_text TEXT;