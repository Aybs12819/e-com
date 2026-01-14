-- Add RLS policy for admin and logistics roles to view customer_accounts
create policy "Admins and Logistics can view all customer accounts" on customer_accounts for select 
using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'logistics')));