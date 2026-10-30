-- Eliminar usuarios desde el panel de administración.
-- Borrar la fila de auth.users elimina en cascada su perfil, postulaciones, guardados y conexiones.
-- Si era dueño de una empresa, la empresa queda sin dueño (owner_id = null) y el admin decide si la elimina.

create or replace function public.admin_delete_user(target uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede eliminar usuarios' using errcode = '42501';
  end if;
  if target = auth.uid() then
    raise exception 'No puedes eliminar tu propia cuenta' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.profiles where id = target and role = 'admin') then
    raise exception 'Quita primero el rol de administrador' using errcode = 'P0001';
  end if;
  delete from auth.users where id = target;
end $$;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

-- El admin puede borrar la foto y el CV de la cuenta que elimina
create policy "avatars: admin elimina" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and public.is_admin());
create policy "cvs: admin elimina" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and public.is_admin());
