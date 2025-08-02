-- Add department column to maintenance_agreements table
ALTER TABLE maintenance_agreements 
ADD COLUMN department department DEFAULT 'oslo';