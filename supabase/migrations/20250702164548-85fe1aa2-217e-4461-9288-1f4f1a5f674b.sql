-- Fix the handle_new_user function to properly handle enum casting
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
  department_val department;
BEGIN
  -- Safely cast role with fallback
  BEGIN
    user_role_val := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'technician');
  EXCEPTION WHEN invalid_text_representation THEN
    user_role_val := 'technician';
  END;
  
  -- Safely cast department with fallback
  BEGIN
    department_val := COALESCE((NEW.raw_user_meta_data->>'department')::department, 'oslo');
  EXCEPTION WHEN invalid_text_representation THEN
    department_val := 'oslo';
  END;

  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role_val,
    department_val
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;