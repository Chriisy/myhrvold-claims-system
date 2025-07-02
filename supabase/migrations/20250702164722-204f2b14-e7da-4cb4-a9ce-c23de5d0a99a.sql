-- First, let's drop and recreate the trigger with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a much simpler version of the function that handles defaults better
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
  WHEN OTHERS THEN
    -- Log the error and still return NEW to allow user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Also let's make sure the email constraint doesn't cause issues
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_email_key;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email) DEFERRABLE INITIALLY DEFERRED;