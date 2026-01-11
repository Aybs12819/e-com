DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- Trigger to create profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  IF (new.raw_user_meta_data->>'role') = 'customer' THEN
    insert into public.customer_accounts (id, first_name, middle_name, last_name, birthdate, address, email, phone)
    values (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'middle_name',
      new.raw_user_meta_data->>'last_name',
      (new.raw_user_meta_data->>'birthdate')::date,
      new.raw_user_meta_data->>'address',
      new.email,
      new.phone
    );
  ELSE
    insert into public.profiles (id, role, avatar_url)
    values (
      new.id,
      new.raw_user_meta_data->>'role',
      new.raw_user_meta_data->>'avatar_url'
    );
  END IF;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
