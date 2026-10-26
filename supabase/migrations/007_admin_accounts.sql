-- Individual dashboard accounts; only server code can read or manage roles.
create table public.admin_accounts (
  user_id uuid primary key references auth.users(id) on delete restrict,
  email text not null,
  role text not null check (role in ('owner', 'viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.admin_accounts enable row level security;

-- Serialize role changes so two requests cannot remove the last owner.
create function public.manage_admin_account(actor uuid, target uuid, account_email text, account_role text, account_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(725104);
  if not exists (select 1 from admin_accounts where user_id = actor and active and role = 'owner') then
    raise exception 'Owner permission required';
  end if;
  if exists (select 1 from admin_accounts where user_id = target and active and role = 'owner')
     and (not account_active or account_role <> 'owner')
     and (select count(*) from admin_accounts where active and role = 'owner') <= 1 then
    raise exception 'Cannot remove the last owner';
  end if;
  insert into admin_accounts(user_id,email,role,active)
  values(target,account_email,account_role,account_active)
  on conflict(user_id) do update set role = excluded.role, active = excluded.active;
end;
$$;
revoke all on function public.manage_admin_account(uuid,uuid,text,text,boolean) from public, anon, authenticated;
grant execute on function public.manage_admin_account(uuid,uuid,text,text,boolean) to service_role;
