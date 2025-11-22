-- Create a secure function to count active sessions for the current user
-- This allows us to determine if there are other active sessions
create or replace function public.get_active_session_count()
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::integer
  from auth.sessions
  where user_id = auth.uid();
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_active_session_count to authenticated;
