-- Create parts table for autocomplete functionality
CREATE TABLE public.parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  unit_price NUMERIC DEFAULT 0,
  supplier_name TEXT,
  category TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create customers table for autocomplete functionality  
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_number TEXT NOT NULL UNIQUE,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on both tables
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create search indexes for performance
CREATE INDEX idx_parts_part_number ON public.parts(part_number);
CREATE INDEX idx_parts_description ON public.parts(description);
CREATE INDEX idx_customers_name ON public.customers(customer_name);
CREATE INDEX idx_customers_number ON public.customers(customer_number);

-- RLS Policies for parts table
CREATE POLICY "Anyone can view active parts" 
ON public.parts 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create parts" 
ON public.parts 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage parts" 
ON public.parts 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for customers table
CREATE POLICY "Anyone can view active customers" 
ON public.customers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Authenticated users can create customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can manage customers" 
ON public.customers 
FOR ALL 
USING (get_current_user_role() = 'admin');