-- Add missing customer and business fields to claims table
ALTER TABLE public.claims ADD COLUMN customer_number TEXT;
ALTER TABLE public.claims ADD COLUMN ms_job_number TEXT;

-- Add detailed cost breakdown fields
ALTER TABLE public.claims ADD COLUMN travel_hours DECIMAL(5,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN travel_distance_km DECIMAL(8,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN vehicle_cost_per_km DECIMAL(6,2) DEFAULT 7.5; -- Norwegian standard
ALTER TABLE public.claims ADD COLUMN consumables_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN external_services_cost DECIMAL(10,2) DEFAULT 0;

-- Add refund breakdown fields
ALTER TABLE public.claims ADD COLUMN refunded_work_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN refunded_travel_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN refunded_vehicle_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN refunded_parts_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN refunded_other_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.claims ADD COLUMN refund_date_received DATE;

-- Add refund status checkboxes
ALTER TABLE public.claims ADD COLUMN work_cost_refunded BOOLEAN DEFAULT false;
ALTER TABLE public.claims ADD COLUMN travel_cost_refunded BOOLEAN DEFAULT false;
ALTER TABLE public.claims ADD COLUMN vehicle_cost_refunded BOOLEAN DEFAULT false;
ALTER TABLE public.claims ADD COLUMN parts_cost_refunded BOOLEAN DEFAULT false;
ALTER TABLE public.claims ADD COLUMN other_cost_refunded BOOLEAN DEFAULT false;

-- Update the total_cost calculation to include new cost fields
ALTER TABLE public.claims DROP COLUMN total_cost;
ALTER TABLE public.claims ADD COLUMN total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
  (work_hours * hourly_rate) + 
  (travel_hours * hourly_rate) + 
  (travel_distance_km * vehicle_cost_per_km) + 
  parts_cost + 
  consumables_cost + 
  external_services_cost + 
  travel_cost
) STORED;

-- Add calculated refund total
ALTER TABLE public.claims ADD COLUMN total_refunded DECIMAL(10,2) GENERATED ALWAYS AS (
  refunded_work_cost + 
  refunded_travel_cost + 
  refunded_vehicle_cost + 
  refunded_parts_cost + 
  refunded_other_cost
) STORED;

-- Add net cost calculation (total cost - total refunded)
ALTER TABLE public.claims ADD COLUMN net_cost DECIMAL(10,2) GENERATED ALWAYS AS (
  (work_hours * hourly_rate) + 
  (travel_hours * hourly_rate) + 
  (travel_distance_km * vehicle_cost_per_km) + 
  parts_cost + 
  consumables_cost + 
  external_services_cost + 
  travel_cost -
  (refunded_work_cost + refunded_travel_cost + refunded_vehicle_cost + refunded_parts_cost + refunded_other_cost)
) STORED;

-- Create supplier refund profiles table
CREATE TABLE public.supplier_refund_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL UNIQUE,
  refunds_work BOOLEAN DEFAULT false,
  refunds_parts BOOLEAN DEFAULT false,
  refunds_travel BOOLEAN DEFAULT false,
  refunds_vehicle BOOLEAN DEFAULT false,
  travel_limit_km INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert supplier refund profiles
INSERT INTO public.supplier_refund_profiles (supplier_name, refunds_work, refunds_parts, refunds_travel, refunds_vehicle, travel_limit_km, notes) VALUES
('Rational', true, true, false, false, null, 'Refunderer arbeid og deler, aldri reisetid eller kjøretøy'),
('Comenda', true, true, true, true, null, 'Refunderer alt under garanti, ikke reise hvis kundefeil'),
('Hobart', false, true, false, false, null, 'Kun deler refunderes, aldri arbeidstid'),
('Winterhalter', true, true, false, false, 50, 'Arbeid + deler refunderes, ikke reise over 50km'),
('Electrolux', false, true, false, false, null, 'Kun deler refunderes, service aldri refundert'),
('Annet', false, false, false, false, null, 'Varierer per leverandør');

-- Enable RLS on supplier_refund_profiles
ALTER TABLE public.supplier_refund_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy for supplier refund profiles (readable by all authenticated users)
CREATE POLICY "Anyone can view supplier refund profiles"
  ON public.supplier_refund_profiles FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage supplier refund profiles"
  ON public.supplier_refund_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );