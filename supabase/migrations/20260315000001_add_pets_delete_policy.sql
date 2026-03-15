-- Add missing DELETE policy for pets

CREATE POLICY "pets_delete_own"
  ON public.pets FOR DELETE
  USING (
    auth.uid() = responsible_profile_id
    OR auth.uid() = created_by_profile_id
  );
