-- 5. Update Profiles Table and Auth Triggers

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone_number text;

ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'logistics', 'rider'));


-- Recreate the handle_new_user function to handle customer_accounts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  IF (new.raw_user_meta_data->>'role') = 'customer' THEN
    insert into public.customer_accounts (id, first_name, middle_name, last_name, birthdate, address, email, phone)
    values (
      new.id,
      COALESCE(new.raw_user_meta_data->>'first_name', NULL),
      COALESCE(new.raw_user_meta_data->>'middle_name', NULL),
      COALESCE(new.raw_user_meta_data->>'last_name', NULL),
      NULLIF(new.raw_user_meta_data->>'birthdate', '')::date,
      COALESCE(new.raw_user_meta_data->>'address', NULL),
      new.email,
      new.phone
    );
  ELSE
    insert into public.profiles (id, role, avatar_url, full_name, email, phone_number)
    values (
      new.id,
      new.raw_user_meta_data->>'role',
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'full_name',
      new.email,
      new.phone
    );
  END IF;
  return new;
end;
$$ language plpgsql security definer;


create or replace function public.handle_user_metadata_update()
returns trigger as $$
begin
  IF (new.raw_user_meta_data->>'role') = 'customer' THEN
    update public.customer_accounts
    set
      first_name = COALESCE(new.raw_user_meta_data->>'first_name', NULL),
      middle_name = COALESCE(new.raw_user_meta_data->>'middle_name', NULL),
      last_name = COALESCE(new.raw_user_meta_data->>'last_name', NULL),
      birthdate = NULLIF(new.raw_user_meta_data->>'birthdate', '')::date,
      address = COALESCE(new.raw_user_meta_data->>'address', NULL),
      email = new.email,
      phone = new.phone,
      updated_at = timezone('utc'::text, now())
    where id = new.id;
  END IF;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_metadata_update();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();