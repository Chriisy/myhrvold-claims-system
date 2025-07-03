-- PHASE A: Core Business System Implementation
-- 1. Create suppliers table with real Myhrvoldgruppen data
-- 2. Update account code generation logic  
-- 3. Clean up system for production use

-- Create suppliers table if not exists
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  category TEXT,
  supplier_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Anyone can view suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Insert real Myhrvoldgruppen suppliers from website
INSERT INTO public.suppliers (name, email, category, supplier_code, contact_person) VALUES
-- MAIN EQUIPMENT SUPPLIERS
('Rational', 'claims@rational.no', 'Kombidamper', 'RAT', 'Service Team'),
('Winterhalter', 'support@winterhalter.no', 'Oppvask', 'WIN', 'Support Team'),
('Comenda', 'service@comenda.com', 'Oppvask', 'COM', 'Service Team'),
('Robot Coupe', 'service@robotcoupe.no', 'Kjøkkenutstyr', 'ROB', 'Service Team'),
('Bizerba', 'service@bizerba.no', 'Vekt/Sag', 'BIZ', 'Service Team'),
('Scotsman', 'support@scotsman.no', 'Ismaskin', 'SCO', 'Support Team'),
('MKN', 'service@mkn.de', 'Koketopper', 'MKN', 'Service Team'),
('Frima', 'service@frima.com', 'Kombidamper', 'FRI', 'Service Team'),
('Hallde', 'service@hallde.se', 'Kjøkkenutstyr', 'HAL', 'Service Team'),
('Varimixer', 'service@varimixer.dk', 'Røremaskiner', 'VAR', 'Service Team'),
('Ubert', 'support@ubert.com', 'Kjøkkenutstyr', 'UBE', 'Support Team'),
('Granuldisk', 'service@granuldisk.se', 'Oppvask', 'GRA', 'Service Team'),
('Bertos', 'service@bertos.it', 'Koketopper', 'BER', 'Service Team'),
('Citrocasa', 'support@citrocasa.com', 'Juicemaskiner', 'CIT', 'Support Team'),
('Coldline', 'service@coldline.it', 'Kjøling', 'COL', 'Service Team'),
('Dry Ager', 'support@dryager.com', 'Modning', 'DRY', 'Support Team'),
('Tefcold', 'service@tefcold.dk', 'Kjøling', 'TEF', 'Service Team'),
('Sveba Dahlen', 'service@svebadahlen.se', 'Ovner', 'SVE', 'Service Team'),
('Josper', 'service@josper.com', 'Griller', 'JOS', 'Service Team'),
('Henkelman', 'service@henkelman.nl', 'Vakuumpacking', 'HEN', 'Service Team'),
('Cuppone', 'service@cuppone.it', 'Pizzaovner', 'CUP', 'Service Team'),
('Miele', 'service@miele.no', 'Oppvask', 'MIE', 'Service Team'),
('Hoshizaki', 'service@hoshizaki.com', 'Ismaskin', 'HOS', 'Service Team'),
('Sinmag', 'service@sinmag.com', 'Bakeriutstyr', 'SIN', 'Service Team'),
('Menu System', 'support@menusystem.no', 'Kjøkkenutstyr', 'MEN', 'Support Team'),
('Valentine', 'service@valentine-equipment.com', 'Frityr', 'VAL', 'Service Team'),
('Elektrotermo', 'service@elektrotermo.se', 'Bakeriutstyr', 'ELE', 'Service Team'),
('Bonamat', 'service@bonamat.com', 'Kaffemaskiner', 'BON', 'Service Team'),
('Sirman', 'service@sirman.it', 'Kjøkkenutstyr', 'SIR', 'Service Team'),
('LaMinerva', 'service@laminerva.it', 'Kaffemaskiner', 'LAM', 'Service Team'),
('La Spaziale', 'service@laspaziale.com', 'Kaffemaskiner', 'SPA', 'Service Team'),
('Cooktek', 'service@cooktek.com', 'Induksjon', 'COO', 'Service Team'),
('Gastro Production', 'service@gastroproduction.com', 'Kjøkkenutstyr', 'GAS', 'Service Team')
ON CONFLICT (name) DO NOTHING;

-- Update the generate_account_code function with correct Norwegian business logic
CREATE OR REPLACE FUNCTION public.generate_account_code(
  p_issue_type issue_type, 
  p_product_name text, 
  p_customer_name text
)
RETURNS TABLE(account_code text, account_string text)
LANGUAGE plpgsql
AS $$
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
$$;

-- Create trigger to auto-generate claim fields including account codes
CREATE OR REPLACE FUNCTION public.auto_generate_claim_fields()
RETURNS TRIGGER AS $$
DECLARE
  acc_code TEXT;
  acc_string TEXT;
BEGIN
  -- Generate claim number if not provided
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  
  -- Generate account code and string
  SELECT ac.account_code, ac.account_string
  INTO acc_code, acc_string
  FROM generate_account_code(NEW.issue_type, NEW.product_name, NEW.customer_name) ac;
  
  NEW.account_code := acc_code;
  NEW.account_string := acc_string;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS auto_generate_claim_fields_trigger ON public.claims;
CREATE TRIGGER auto_generate_claim_fields_trigger
  BEFORE INSERT ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_claim_fields();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON public.claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_department ON public.claims(department);
CREATE INDEX IF NOT EXISTS idx_claims_created_date ON public.claims(created_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);

-- Grant necessary permissions
GRANT SELECT ON public.suppliers TO authenticated;
GRANT INSERT, UPDATE ON public.suppliers TO authenticated;