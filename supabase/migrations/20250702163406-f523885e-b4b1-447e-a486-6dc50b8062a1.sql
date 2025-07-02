-- Create enums for business logic
CREATE TYPE claim_status AS ENUM ('new', 'pending_approval', 'under_processing', 'sent_supplier', 'awaiting_response', 'resolved', 'rejected');
CREATE TYPE issue_type AS ENUM ('warranty', 'claim', 'service_callback', 'extended_warranty');
CREATE TYPE urgency_level AS ENUM ('low', 'normal', 'high', 'critical');
CREATE TYPE refund_status AS ENUM ('pending', 'received', 'rejected');
CREATE TYPE user_role AS ENUM ('technician', 'admin');
CREATE TYPE department AS ENUM ('oslo', 'bergen', 'trondheim', 'stavanger', 'kristiansand', 'nord_norge', 'innlandet');

-- Create users table (profiles extension of auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'technician',
  department department NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create claims table with all business fields
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_number TEXT NOT NULL UNIQUE,
  status claim_status NOT NULL DEFAULT 'new',
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_contact TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Product information
  product_name TEXT NOT NULL,
  product_model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_period TEXT,
  supplier TEXT NOT NULL,
  
  -- Issue details
  issue_type issue_type NOT NULL,
  issue_description TEXT NOT NULL,
  detailed_description TEXT,
  urgency_level urgency_level NOT NULL DEFAULT 'normal',
  
  -- Business/economic fields
  technician_name TEXT NOT NULL,
  department department NOT NULL,
  evatic_job_number TEXT,
  work_hours DECIMAL(5,2) DEFAULT 0,
  hourly_rate DECIMAL(8,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  travel_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (work_hours * hourly_rate + parts_cost + travel_cost) STORED,
  expected_refund DECIMAL(10,2) DEFAULT 0,
  actual_refund DECIMAL(10,2),
  credit_note_number TEXT,
  refund_status refund_status DEFAULT 'pending',
  
  -- Account coding
  account_code TEXT,
  account_string TEXT,
  
  -- Workflow management
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_admin UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  supplier_email_sent_date TIMESTAMP WITH TIME ZONE,
  supplier_response_date TIMESTAMP WITH TIME ZONE,
  
  -- Files and notes
  files JSONB DEFAULT '[]'::jsonb,
  internal_notes TEXT,
  customer_notes TEXT,
  supplier_notes TEXT
);

-- Enable RLS on claims
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Create claim_timeline table for status history
CREATE TABLE public.claim_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  status claim_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on claim_timeline
ALTER TABLE public.claim_timeline ENABLE ROW LEVEL SECURITY;

-- Function to generate claim numbers (RK-2024-001 format)
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_number INTEGER;
  claim_number TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(RIGHT(claim_number, 3) AS INTEGER)), 0) + 1
  INTO next_number
  FROM claims
  WHERE claim_number LIKE 'RK-' || current_year || '-%';
  
  claim_number := 'RK-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
  RETURN claim_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate account code and string
CREATE OR REPLACE FUNCTION generate_account_code(p_issue_type issue_type, p_product_name TEXT, p_customer_name TEXT)
RETURNS TABLE(account_code TEXT, account_string TEXT) AS $$
DECLARE
  code TEXT;
BEGIN
  CASE p_issue_type
    WHEN 'service_callback' THEN code := '4506';
    WHEN 'warranty' THEN code := '7550';
    WHEN 'claim' THEN code := '7555';
    WHEN 'extended_warranty' THEN code := '7566';
    ELSE code := '7550';
  END CASE;
  
  RETURN QUERY SELECT code, code || ';' || p_product_name || ';' || p_customer_name;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate claim number and account codes
CREATE OR REPLACE FUNCTION auto_generate_claim_fields()
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

-- Trigger to update updated_date
CREATE OR REPLACE FUNCTION update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER auto_generate_claim_fields_trigger
  BEFORE INSERT ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_claim_fields();

CREATE TRIGGER update_claims_updated_date
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date();

CREATE TRIGGER update_profiles_updated_date
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_date();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'technician'),
    COALESCE((NEW.raw_user_meta_data->>'department')::department, 'oslo')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for claims
CREATE POLICY "Users can view claims"
  ON public.claims FOR SELECT
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2
      WHERE p1.id = auth.uid() AND p2.id = claims.created_by
      AND p1.department = p2.department AND p1.role = 'technician'
    )
  );

CREATE POLICY "Users can create claims"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and creators can update claims"
  ON public.claims FOR UPDATE
  USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for claim timeline
CREATE POLICY "Users can view timeline for accessible claims"
  ON public.claim_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.claims
      WHERE claims.id = claim_timeline.claim_id
      AND (
        auth.uid() = claims.created_by OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

CREATE POLICY "Users can create timeline entries"
  ON public.claim_timeline FOR INSERT
  WITH CHECK (auth.uid() = changed_by);

-- Insert default admin user data (will be created when first admin signs up)
-- Insert sample suppliers, departments, and technicians data
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  contact_person TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO public.suppliers (name, email, contact_person) VALUES
  ('Rational', 'service@rational.no', 'Rational Support'),
  ('Comenda', 'support@comenda.no', 'Comenda Service'),
  ('Hobart', 'service@hobart.no', 'Hobart Norge'),
  ('Winterhalter', 'support@winterhalter.no', 'Winterhalter Service'),
  ('Electrolux', 'service@electrolux.no', 'Electrolux Professional'),
  ('Annet', null, 'Other Supplier');

-- Enable RLS on suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view suppliers"
  ON public.suppliers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage suppliers"
  ON public.suppliers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );