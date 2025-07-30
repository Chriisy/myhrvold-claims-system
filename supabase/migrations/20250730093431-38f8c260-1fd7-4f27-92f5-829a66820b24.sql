-- Create storage bucket for claim attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-attachments', 'claim-attachments', true);

-- Create storage policies for claim attachments
CREATE POLICY "Authenticated users can upload claim attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'claim-attachments');

CREATE POLICY "Users can view claim attachments" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'claim-attachments');

CREATE POLICY "Users can update their own claim attachments" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'claim-attachments');

CREATE POLICY "Users can delete their own claim attachments" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'claim-attachments');