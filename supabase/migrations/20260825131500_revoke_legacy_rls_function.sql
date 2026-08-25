do $$
begin
  if exists (
    select 1
    from pg_proc f
    join pg_namespace n on n.oid = f.pronamespace
    where n.nspname = 'public' and f.proname = 'rls_auto_enable' and pg_get_function_identity_arguments(f.oid) = ''
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
