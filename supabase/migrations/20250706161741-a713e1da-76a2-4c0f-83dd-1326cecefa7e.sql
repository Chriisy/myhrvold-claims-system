-- Add OCR-related fields to claims table
ALTER TABLE claims ADD COLUMN IF NOT EXISTS scanned_invoice_url TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS ocr_confidence_score DECIMAL(3,2);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS ocr_processed_at TIMESTAMP WITH TIME ZONE;

-- Create OCR analytics table for tracking usage and accuracy
CREATE TABLE IF NOT EXISTS public.ocr_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  claim_id UUID,
  success BOOLEAN NOT NULL DEFAULT false,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  fields_extracted JSONB DEFAULT '{}',
  user_corrections JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on OCR analytics
ALTER TABLE public.ocr_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for OCR analytics
CREATE POLICY "Users can view their own OCR analytics" 
ON public.ocr_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own OCR analytics" 
ON public.ocr_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);