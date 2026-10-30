-- Notificaciones dentro del portal (campana en la barra superior).
-- Las crean solo los triggers de abajo; cada usuario solo ve, marca como leídas y borra las suyas.

create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  link text not null default '/',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

alter table public.notifications enable row level security;
create policy "notifications: ver las mías" on public.notifications for select using (user_id = auth.uid());
create policy "notifications: marcar las mías" on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: borrar las mías" on public.notifications for delete using (user_id = auth.uid());

-- Al marcar como leída solo puede cambiar read_at
create or replace function public.protect_notification()
returns trigger language plpgsql as $$
begin
  new.user_id := old.user_id; new.actor_id := old.actor_id; new.kind := old.kind;
  new.title := old.title; new.body := old.body; new.link := old.link; new.created_at := old.created_at;
  return new;
end $$;
create trigger notifications_protect before update on public.notifications for each row execute function public.protect_notification();

create or replace function public.person_name(pid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif(trim(first_name || ' ' || last_name), ''), 'Alguien') from public.profiles where id = pid
$$;

-- Alguien conectó contigo (máximo un aviso por persona cada 24 h, por si conecta y desconecta)
create or replace function public.notify_connection()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  mutual boolean := exists (select 1 from public.connections where from_id = new.to_id and to_id = new.from_id);
begin
  if exists (select 1 from public.notifications where user_id = new.to_id and actor_id = new.from_id
             and kind = 'conexion' and created_at > now() - interval '24 hours') then
    return null;
  end if;
  insert into public.notifications (user_id, actor_id, kind, title, body, link)
  values (new.to_id, new.from_id, 'conexion',
          public.person_name(new.from_id) || ' conectó contigo',
          case when mutual then 'Ahora son conexión mutua.' else 'Visita su perfil y conecta de vuelta.' end,
          '/comunidad/' || new.from_id);
  return null;
end $$;
create trigger connections_notify after insert on public.connections for each row execute function public.notify_connection();

-- Postulaciones: aviso a la empresa (nueva) y al estudiante (cambio de estado)
create or replace function public.notify_application()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  o record;
begin
  select ofr.title, c.owner_id, c.short_name into o
  from public.offers ofr join public.companies c on c.id = ofr.company_id where ofr.id = new.offer_id;

  if tg_op = 'INSERT' then
    if o.owner_id is not null then
      insert into public.notifications (user_id, actor_id, kind, title, body, link)
      values (o.owner_id, new.student_id, 'postulacion',
              'Nueva postulación: ' || o.title,
              public.person_name(new.student_id) || ' postuló a tu oferta.',
              '/empresa/ofertas/' || new.offer_id || '/postulantes');
    end if;
  elsif new.status is distinct from old.status and new.status <> 'postulado' then
    insert into public.notifications (user_id, kind, title, body, link)
    values (new.student_id, 'estado',
            case new.status
              when 'revision' then 'Tu postulación está en revisión'
              when 'entrevista' then '¡Te invitan a una entrevista!'
              when 'aceptado' then '¡Fuiste aceptado/a!'
              else 'Actualización de tu postulación'
            end,
            o.title || ' · ' || o.short_name ||
            case new.status when 'rechazado' then ' — esta vez no fuiste seleccionado/a. ¡Sigue postulando!' else '' end,
            '/postulaciones');
  end if;
  return null;
end $$;
create trigger applications_notify after insert or update of status on public.applications for each row execute function public.notify_application();

-- Empresas: aviso a los admins (nueva por verificar) y al dueño (verificada o rechazada)
create or replace function public.notify_company()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, actor_id, kind, title, body, link)
    select p.id, new.owner_id, 'empresa', 'Empresa por verificar: ' || new.short_name,
           'Revisa sus datos y verifícala para que pueda publicar ofertas.', '/admin/empresas'
    from public.profiles p where p.role = 'admin';
  elsif new.status is distinct from old.status and new.owner_id is not null and new.status <> 'pendiente' then
    insert into public.notifications (user_id, kind, title, body, link)
    values (new.owner_id, 'empresa',
            case new.status when 'verificada' then '¡Tu empresa fue verificada!' else 'La verificación de tu empresa fue rechazada' end,
            case new.status when 'verificada' then 'Ya puedes publicar ofertas.' else coalesce(new.review_note, 'Revisa tus datos en «Editar empresa».') end,
            '/empresa');
  end if;
  return null;
end $$;
create trigger companies_notify after insert or update of status on public.companies for each row execute function public.notify_company();
