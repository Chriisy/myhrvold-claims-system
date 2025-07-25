-- Add overtime and custom line items to claims table
ALTER TABLE claims 
ADD COLUMN overtime_50_hours numeric DEFAULT 0,
ADD COLUMN overtime_100_hours numeric DEFAULT 0,
ADD COLUMN custom_line_items jsonb DEFAULT '[]'::jsonb;