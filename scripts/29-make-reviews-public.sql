DROP POLICY "Users can view their own reviews" ON public.reviews;

CREATE POLICY "All users can view reviews" ON public.reviews
  FOR SELECT USING (TRUE);