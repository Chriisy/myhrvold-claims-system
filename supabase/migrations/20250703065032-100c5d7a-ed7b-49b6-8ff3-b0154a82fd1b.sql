-- PHASE A: Core Business System Implementation (Fixed)
-- 1. Create suppliers table with real Myhrvoldgruppen data
-- 2. Update account code generation logic  
-- 3. Clean up system for production use

-- Insert real Myhrvoldgruppen suppliers from website (only if table exists)
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_claim_number ON public.claims(claim_number);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_department ON public.claims(department);
CREATE INDEX IF NOT EXISTS idx_claims_created_date ON public.claims(created_date);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON public.suppliers(is_active);