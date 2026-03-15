-- Fix INSERT policies to allow responsible profile
DROP POLICY IF EXISTS "pet_photos_insert" ON public.pet_photos;
CREATE POLICY "pet_photos_insert"
  ON public.pet_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "pet_color_assignments_insert" ON public.pet_color_assignments;
CREATE POLICY "pet_color_assignments_insert"
  ON public.pet_color_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "pet_trait_assignments_insert" ON public.pet_trait_assignments;
CREATE POLICY "pet_trait_assignments_insert"
  ON public.pet_trait_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

-- Add missing UPDATE and DELETE policies
CREATE POLICY "pet_photos_update"
  ON public.pet_photos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

CREATE POLICY "pet_photos_delete"
  ON public.pet_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

CREATE POLICY "pet_color_assignments_delete"
  ON public.pet_color_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );

CREATE POLICY "pet_trait_assignments_delete"
  ON public.pet_trait_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets p
      WHERE p.id = pet_id
        AND (p.created_by_profile_id = auth.uid() OR p.responsible_profile_id = auth.uid())
    )
  );
