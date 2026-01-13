-- 25. Add address and id_image_url to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS id_image_url text;