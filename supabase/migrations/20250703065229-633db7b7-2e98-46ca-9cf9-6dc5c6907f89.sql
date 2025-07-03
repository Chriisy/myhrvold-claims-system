-- Insert real Myhrvoldgruppen suppliers with existing table structure
INSERT INTO public.suppliers (name, email, contact_person, phone) VALUES
-- MAIN EQUIPMENT SUPPLIERS  
('Rational', 'claims@rational.no', 'Service Team', '+47 67 15 91 00'),
('Winterhalter', 'support@winterhalter.no', 'Support Team', '+47 32 20 30 00'),
('Comenda', 'service@comenda.com', 'Service Team', '+39 049 9698 111'),
('Robot Coupe', 'service@robotcoupe.no', 'Service Team', '+47 67 15 91 00'),
('Bizerba', 'service@bizerba.no', 'Service Team', '+47 67 15 91 00'),
('Scotsman', 'support@scotsman.no', 'Support Team', '+47 67 15 91 00'),
('MKN', 'service@mkn.de', 'Service Team', '+49 6053 608 0'),
('Frima', 'service@frima.com', 'Service Team', '+41 56 484 91 11'),
('Hallde', 'service@hallde.se', 'Service Team', '+46 42 25 11 00'),
('Varimixer', 'service@varimixer.dk', 'Service Team', '+45 70 25 48 00'),
('Ubert', 'support@ubert.com', 'Support Team', '+39 049 9698 111'),
('Granuldisk', 'service@granuldisk.se', 'Service Team', '+46 19 15 80 00'),
('Bertos', 'service@bertos.it', 'Service Team', '+39 049 9698 111'),
('Citrocasa', 'support@citrocasa.com', 'Support Team', '+39 049 9698 111'),
('Coldline', 'service@coldline.it', 'Service Team', '+39 049 9698 111'),
('Dry Ager', 'support@dryager.com', 'Support Team', '+49 89 3065 4687'),
('Tefcold', 'service@tefcold.dk', 'Service Team', '+45 70 25 48 00'),
('Sveba Dahlen', 'service@svebadahlen.se', 'Service Team', '+46 19 15 80 00'),
('Josper', 'service@josper.com', 'Service Team', '+34 93 570 40 13'),
('Henkelman', 'service@henkelman.nl', 'Service Team', '+31 299 422 792'),
('Cuppone', 'service@cuppone.it', 'Service Team', '+39 081 777 3507'),
('Miele', 'service@miele.no', 'Service Team', '+47 67 15 91 00'),
('Hoshizaki', 'service@hoshizaki.com', 'Service Team', '+44 1582 440 777'),
('Sinmag', 'service@sinmag.com', 'Service Team', '+886 3 990 1815'),
('Menu System', 'support@menusystem.no', 'Support Team', '+47 67 15 91 00'),
('Valentine', 'service@valentine-equipment.com', 'Service Team', '+33 1 39 30 57 00'),
('Elektrotermo', 'service@elektrotermo.se', 'Service Team', '+46 19 15 80 00'),
('Bonamat', 'service@bonamat.com', 'Service Team', '+31 348 493 030'),
('Sirman', 'service@sirman.it', 'Service Team', '+39 049 9698 111'),
('LaMinerva', 'service@laminerva.it', 'Service Team', '+39 049 9698 111'),
('La Spaziale', 'service@laspaziale.com', 'Service Team', '+39 049 9698 111'),
('Cooktek', 'service@cooktek.com', 'Service Team', '+1 847 888 3501'),
('Gastro Production', 'service@gastroproduction.com', 'Service Team', '+39 049 9698 111')
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