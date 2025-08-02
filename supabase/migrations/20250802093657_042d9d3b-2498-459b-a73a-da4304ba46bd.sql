-- Add new columns to maintenance_agreements table for warranty terms, service procedures and contact info
ALTER TABLE maintenance_agreements 
ADD COLUMN garantivilkar TEXT,
ADD COLUMN prosedyrer_ved_service TEXT,
ADD COLUMN kontakt_info TEXT;