-- First, create the missing profile for the existing user
INSERT INTO public.profiles (id, email, full_name, role, department)
VALUES (
  'cd5e0ac0-f013-4ffc-83f1-80424af97906',
  'christopher.strom@myhrvold.no', 
  'Christopher Strøm',
  'admin'::user_role,
  'oslo'::department
);

-- Improve the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      ELSE 'technician'::user_role
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'department' = 'oslo' THEN 'oslo'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'bergen' THEN 'bergen'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'trondheim' THEN 'trondheim'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'stavanger' THEN 'stavanger'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'kristiansand' THEN 'kristiansand'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'nord_norge' THEN 'nord_norge'::department
      WHEN NEW.raw_user_meta_data->>'department' = 'innlandet' THEN 'innlandet'::department
      ELSE 'oslo'::department
    END
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return NEW
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error and still return NEW to allow user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Make sure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();