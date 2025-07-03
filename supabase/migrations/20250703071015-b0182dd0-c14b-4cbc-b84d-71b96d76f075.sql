-- Slett eventuelle konflikter og opprett Christopher som admin
DELETE FROM public.profiles WHERE email = 'christopher.strom@myhrvold.no';

-- Opprett ny admin-profil
INSERT INTO public.profiles (
  id,
  email, 
  full_name, 
  role, 
  department, 
  is_active
) VALUES (
  gen_random_uuid(),
  'christopher.strom@myhrvold.no',
  'Christopher Strøm',
  'admin',
  'oslo',
  true
);