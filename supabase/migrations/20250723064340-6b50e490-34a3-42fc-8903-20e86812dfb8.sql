-- Allow admins and claim creators to delete claims
CREATE POLICY "Admins and creators can delete claims" 
ON public.claims 
FOR DELETE 
USING (
  (auth.uid() = created_by) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role
  ))
);