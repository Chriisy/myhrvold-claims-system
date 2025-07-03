-- Opprett Christopher som administrator
INSERT INTO public.profiles (
  id,
  email, 
  full_name, 
  role, 
  department, 
  is_active
) VALUES (
  -- Trenger faktisk bruker-ID fra auth tabellen
  -- Men la oss først se om brukeren eksisterer i auth systemet
  gen_random_uuid(), -- Midlertidig ID
  'christopher.strom@myhrvold.no',
  'Christopher Strøm',
  'admin',
  'oslo',
  true
)
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_active = true;