-- Maintenance Module Migration
-- Creates tables for service contracts, equipment, visits, and tasks

-- ENUMS for Norwegian status values (PostgreSQL doesn't support IF NOT EXISTS for ENUMs)
DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('planlagt', 'pågår', 'fullført', 'avbrutt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('avventer', 'fullført', 'utsatt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE visit_type AS ENUM ('rutine', 'reparasjon', 'installasjon', 'inspeksjon');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Maintenance Agreements table
CREATE TABLE IF NOT EXISTS public.maintenance_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avtale_nummer TEXT NOT NULL UNIQUE,
    kunde_id UUID REFERENCES public.customers(id),
    kunde_navn TEXT NOT NULL,
    kunde_adresse TEXT,
    kontaktperson TEXT,
    telefon TEXT,
    epost TEXT,
    
    -- Contract details
    start_dato DATE NOT NULL,
    slutt_dato DATE,
    besok_per_ar INTEGER NOT NULL DEFAULT 1,
    neste_besok DATE,
    
    -- Pricing
    pris_grunnlag NUMERIC(10,2) NOT NULL DEFAULT 0,
    pris_cpi_justerbar BOOLEAN DEFAULT false,
    sist_cpi_justert DATE,
    signert_dato DATE,
    signert_kpi_verdi NUMERIC(6,3), -- KPI value at signing time
    
    -- Status and metadata
    status maintenance_status DEFAULT 'planlagt',
    beskrivelse TEXT,
    vilkar TEXT,
    intern_notat TEXT,
    
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avtale_id UUID REFERENCES public.maintenance_agreements(id) ON DELETE CASCADE,
    
    -- Equipment details
    produkt_navn TEXT NOT NULL,
    modell TEXT,
    serienummer TEXT,
    produsent TEXT,
    kategori TEXT, -- kjøl/frys/annet
    lokasjon TEXT,
    installasjon_dato DATE,
    
    -- Service intervals
    service_intervall_måneder INTEGER DEFAULT 12,
    siste_service DATE,
    neste_service DATE,
    
    -- Operational data
    driftstimer INTEGER DEFAULT 0,
    miljø_temperatur NUMERIC(4,1),
    miljø_fuktighet NUMERIC(4,1),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    notater TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Service Visits table
CREATE TABLE IF NOT EXISTS public.service_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    avtale_id UUID REFERENCES public.maintenance_agreements(id) ON DELETE CASCADE,
    
    -- Visit scheduling
    planlagt_tid TIMESTAMP WITH TIME ZONE NOT NULL,
    faktisk_starttid TIMESTAMP WITH TIME ZONE,
    faktisk_slutttid TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    tekniker_id UUID REFERENCES public.profiles(id),
    tekniker_navn TEXT,
    visit_type visit_type DEFAULT 'rutine',
    
    -- Status and progress
    status maintenance_status DEFAULT 'planlagt',
    beskrivelse TEXT,
    funn TEXT,
    utført_arbeid TEXT,
    anbefalinger TEXT,
    
    -- Cost tracking
    timer_arbeid NUMERIC(4,2) DEFAULT 0,
    timer_reise NUMERIC(4,2) DEFAULT 0,
    km_reise NUMERIC(6,1) DEFAULT 0,
    deler_kostnad NUMERIC(10,2) DEFAULT 0,
    total_kostnad NUMERIC(10,2) DEFAULT 0,
    
    -- Documentation
    rapport_pdf_url TEXT,
    bilder JSONB DEFAULT '[]',
    signatur_tekniker TEXT,
    signatur_kunde TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Maintenance Tasks table (checklist items for each visit)
CREATE TABLE IF NOT EXISTS public.maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES public.service_visits(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES public.equipment(id),
    
    -- Task details
    oppgave_beskrivelse TEXT NOT NULL,
    prioritet INTEGER DEFAULT 1, -- 1=høy, 2=medium, 3=lav
    estimert_tid_minutter INTEGER,
    
    -- Status and completion
    status task_status DEFAULT 'avventer',
    fullført_tid TIMESTAMP WITH TIME ZONE,
    kommentar TEXT,
    
    -- Results
    resultat TEXT,
    måleverdier JSONB, -- store sensor readings, measurements etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_maintenance_agreements_kunde ON public.maintenance_agreements(kunde_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_agreements_status ON public.maintenance_agreements(status);
CREATE INDEX IF NOT EXISTS idx_equipment_avtale ON public.equipment(avtale_id);
CREATE INDEX IF NOT EXISTS idx_service_visits_avtale ON public.service_visits(avtale_id);
CREATE INDEX IF NOT EXISTS idx_service_visits_tekniker ON public.service_visits(tekniker_id);
CREATE INDEX IF NOT EXISTS idx_service_visits_planlagt_tid ON public.service_visits(planlagt_tid);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_visit ON public.maintenance_tasks(visit_id);

-- Enable RLS on all tables
ALTER TABLE public.maintenance_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_agreements
CREATE POLICY "Tekniker can view agreements for their visits" 
ON public.maintenance_agreements FOR SELECT 
USING (
    get_current_user_role() = 'admin' OR 
    get_current_user_role() = 'technician' AND EXISTS (
        SELECT 1 FROM public.service_visits sv 
        WHERE sv.avtale_id = id AND sv.tekniker_id = auth.uid()
    )
);

CREATE POLICY "Admin can manage all agreements" 
ON public.maintenance_agreements FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for equipment
CREATE POLICY "Users can view equipment for accessible agreements" 
ON public.equipment FOR SELECT 
USING (
    get_current_user_role() = 'admin' OR 
    EXISTS (
        SELECT 1 FROM public.maintenance_agreements ma 
        WHERE ma.id = avtale_id AND (
            get_current_user_role() = 'admin' OR
            EXISTS (
                SELECT 1 FROM public.service_visits sv 
                WHERE sv.avtale_id = ma.id AND sv.tekniker_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Admin can manage all equipment" 
ON public.equipment FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for service_visits
CREATE POLICY "Tekniker can view their own visits" 
ON public.service_visits FOR SELECT 
USING (
    get_current_user_role() = 'admin' OR 
    (get_current_user_role() = 'technician' AND tekniker_id = auth.uid())
);

CREATE POLICY "Tekniker can update their own visits" 
ON public.service_visits FOR UPDATE 
USING (
    get_current_user_role() = 'admin' OR 
    (get_current_user_role() = 'technician' AND tekniker_id = auth.uid())
);

CREATE POLICY "Admin can manage all visits" 
ON public.service_visits FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for maintenance_tasks
CREATE POLICY "Users can view tasks for accessible visits" 
ON public.maintenance_tasks FOR SELECT 
USING (
    get_current_user_role() = 'admin' OR 
    EXISTS (
        SELECT 1 FROM public.service_visits sv 
        WHERE sv.id = visit_id AND (
            get_current_user_role() = 'admin' OR
            (get_current_user_role() = 'technician' AND sv.tekniker_id = auth.uid())
        )
    )
);

CREATE POLICY "Tekniker can update tasks for their visits" 
ON public.maintenance_tasks FOR UPDATE 
USING (
    get_current_user_role() = 'admin' OR 
    EXISTS (
        SELECT 1 FROM public.service_visits sv 
        WHERE sv.id = visit_id AND sv.tekniker_id = auth.uid()
    )
);

CREATE POLICY "Admin can manage all tasks" 
ON public.maintenance_tasks FOR ALL 
USING (get_current_user_role() = 'admin');

-- Enable realtime for all maintenance tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_agreements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_visits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_tasks;

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_maintenance_agreements_updated_at
    BEFORE UPDATE ON public.maintenance_agreements
    FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_updated_at();

CREATE TRIGGER update_equipment_updated_at
    BEFORE UPDATE ON public.equipment
    FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_updated_at();

CREATE TRIGGER update_service_visits_updated_at
    BEFORE UPDATE ON public.service_visits
    FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_updated_at();

CREATE TRIGGER update_maintenance_tasks_updated_at
    BEFORE UPDATE ON public.maintenance_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_updated_at();

-- Function to generate agreement numbers
CREATE OR REPLACE FUNCTION public.generate_agreement_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
    agreement_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(RIGHT(ma.avtale_nummer, 3) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.maintenance_agreements ma
    WHERE ma.avtale_nummer LIKE 'VH-' || current_year || '-%';
    
    agreement_number := 'VH-' || current_year || '-' || LPAD(next_number::TEXT, 3, '0');
    RETURN agreement_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate agreement numbers
CREATE OR REPLACE FUNCTION public.auto_generate_agreement_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate agreement number if not provided
    IF NEW.avtale_nummer IS NULL OR NEW.avtale_nummer = '' THEN
        NEW.avtale_nummer := public.generate_agreement_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_agreement_fields_trigger
    BEFORE INSERT ON public.maintenance_agreements
    FOR EACH ROW EXECUTE FUNCTION public.auto_generate_agreement_fields();

-- Feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
    name TEXT PRIMARY KEY,
    enabled BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable maintenance feature flag
INSERT INTO public.feature_flags (name, enabled, description) 
VALUES ('maintenance_enabled', false, 'Enable maintenance module features')
ON CONFLICT (name) DO NOTHING;