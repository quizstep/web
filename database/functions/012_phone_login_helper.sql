-- ============================================
-- PHONE LOGIN LOOKUP HELPER
-- ============================================
-- Allows lookup of user email via phone number for seamless login
-- using either email or mobile number.

create or replace function public.get_email_by_phone(phone_input text)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  clean_phone text;
  matched_email text;
begin
  -- Strip non-digit characters from input
  clean_phone := regexp_replace(phone_input, '\D', '', 'g');

  -- Handle numbers with country code or leading 0
  if length(clean_phone) > 10 and clean_phone like '91%' then
    clean_phone := substring(clean_phone from 3);
  elsif length(clean_phone) = 11 and clean_phone like '0%' then
    clean_phone := substring(clean_phone from 2);
  end if;

  -- 1. Check auth.users user_metadata for phone
  select email into matched_email
  from auth.users
  where (
    raw_user_meta_data->>'phone' = clean_phone
    or raw_user_meta_data->>'phone' = '+91' || clean_phone
    or raw_user_meta_data->>'formatted_phone' = '+91' || clean_phone
    or phone = clean_phone
    or phone = '+91' || clean_phone
  )
  order by created_at desc
  limit 1;

  if matched_email is not null then
    return matched_email;
  end if;

  -- 2. Check public.profiles table if present
  select u.email into matched_email
  from public.profiles p
  join auth.users u on u.id = p.id
  where (
    regexp_replace(p.phone, '\D', '', 'g') = clean_phone
    or p.phone = clean_phone
    or p.phone = '+91' || clean_phone
  )
  order by p.created_at desc
  limit 1;

  return matched_email;
end;
$$;

-- Grant execution to public anon and authenticated roles
grant execute on function public.get_email_by_phone(text) to anon, authenticated;
