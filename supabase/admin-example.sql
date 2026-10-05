-- Run only from the Supabase SQL editor as the project owner.
-- Create a user in Authentication > Users first, then replace the email below.
-- No passwords or secret keys belong in this file.
insert into public.admin_users (user_id)
select id from auth.users where email = 'REPLACE_WITH_YOUR_ADMIN_EMAIL'
on conflict (user_id) do nothing;
-- Verify the row count; an unknown email inserts zero rows.
select user_id from public.admin_users;
