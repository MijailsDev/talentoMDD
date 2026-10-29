-- =====================================================================
-- TalentoMDD · Esquema inicial
-- Portal de empleabilidad de la UNAMAD (Supabase / PostgreSQL)
-- Ejecutar una sola vez en el SQL Editor de Supabase (o con `supabase db push`).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Configuración: dominio institucional (cámbialo aquí si hace falta)
-- ---------------------------------------------------------------------
create or replace function public.institutional_domain()
returns text language sql immutable as $$ select 'unamad.edu.pe' $$;

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.user_role as enum ('estudiante', 'egresado', 'docente', 'empresa', 'admin');
create type public.offer_type as enum ('pre', 'pro', 'emp', 'vol');
create type public.work_mode as enum ('Presencial', 'Remoto', 'Híbrido');
create type public.app_status as enum ('postulado', 'revision', 'entrevista', 'aceptado', 'rechazado');
create type public.company_status as enum ('pendiente', 'verificada', 'rechazada');

-- ---------------------------------------------------------------------
-- Estructura académica
-- ---------------------------------------------------------------------
create table public.faculties (
  id text primary key,
  name text not null
);

create table public.careers (
  id text primary key,
  faculty_id text not null references public.faculties (id) on delete cascade,
  name text not null,
  icon text not null default 'school'
);

-- ---------------------------------------------------------------------
-- Perfiles (1 a 1 con auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'estudiante',
  first_name text not null default '',
  last_name text not null default '',
  email text not null,
  student_code text,
  phone text,
  career_id text references public.careers (id) on delete set null,
  cycle smallint check (cycle between 1 and 12),
  grad_year smallint,
  headline text not null default '',
  location text not null default 'Puerto Maldonado, Madre de Dios',
  about text not null default '',
  skills text[] not null default '{}',
  languages jsonb not null default '[{"name":"Español","level":"Nativo"}]',
  experience jsonb not null default '[]',
  projects jsonb not null default '[]',
  certifications jsonb not null default '[]',
  avatar_url text,
  cover_url text,
  cv_path text,
  cv_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Empresas
-- ---------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  owner_id uuid references public.profiles (id) on delete set null,
  status public.company_status not null default 'pendiente',
  name text not null,
  short_name text not null,
  legal_name text not null,
  ruc text not null check (ruc ~ '^[0-9]{11}$'),
  sector text not null,
  logo_text text not null default '',
  color text not null default '#A1002C',
  description text not null default '',
  address text not null default '',
  reference text not null default '',
  district text not null default 'Tambopata',
  lat double precision,
  lng double precision,
  phone text not null default '',
  email text not null default '',
  website text not null default '',
  social text not null default '',
  hours text not null default '',
  rep_name text not null default '',
  rep_role text not null default '',
  rep_email text not null default '',
  rep_phone text not null default '',
  rep_photo_url text,
  since_year smallint not null default extract(year from now())::smallint,
  interns_count integer not null default 0,
  logo_url text,
  cover_url text,
  gallery jsonb not null default '[]',
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index companies_owner_idx on public.companies (owner_id);
create index companies_status_idx on public.companies (status);

-- ---------------------------------------------------------------------
-- Ofertas
-- ---------------------------------------------------------------------
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  type public.offer_type not null,
  title text not null,
  mode public.work_mode not null default 'Presencial',
  place text,
  career_ids text[] not null default '{}',
  min_cycle smallint check (min_cycle between 1 and 12),
  graduates_only boolean not null default false,
  pay text not null default '',
  paid boolean not null default true,
  vacancies integer not null default 1 check (vacancies > 0),
  deadline date not null,
  description text not null default '',
  functions text[] not null default '{}',
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  documents text[] not null default '{}',
  benefits text[] not null default '{}',
  schedule text not null default '',
  duration text not null default '',
  start_text text not null default '',
  stages text[] not null default '{}',
  featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index offers_company_idx on public.offers (company_id);
create index offers_deadline_idx on public.offers (deadline);
create index offers_careers_idx on public.offers using gin (career_ids);

-- ---------------------------------------------------------------------
-- Postulaciones, guardados y comunidad
-- ---------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status public.app_status not null default 'postulado',
  message text not null default '',
  cv_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, student_id)
);
create index applications_student_idx on public.applications (student_id);

create table public.application_events (
  id bigint generated always as identity primary key,
  application_id uuid not null references public.applications (id) on delete cascade,
  status public.app_status not null,
  note text not null default '',
  created_at timestamptz not null default now()
);
create index application_events_app_idx on public.application_events (application_id);

create table public.saved_offers (
  student_id uuid not null references public.profiles (id) on delete cascade,
  offer_id uuid not null references public.offers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, offer_id)
);

create table public.connections (
  from_id uuid not null references public.profiles (id) on delete cascade,
  to_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (from_id, to_id),
  check (from_id <> to_id)
);

create table public.news (
  id bigint generated always as identity primary key,
  event_date date not null default current_date,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Funciones auxiliares (security definer para usarlas dentro de RLS)
-- ---------------------------------------------------------------------
create or replace function public.current_role_name()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.owns_company(cid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.companies where id = cid and owner_id = auth.uid())
$$;

create or replace function public.owns_offer(oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.offers o join public.companies c on c.id = o.company_id
    where o.id = oid and c.owner_id = auth.uid()
  )
$$;

-- ¿El usuario actual (empresa) recibió una postulación de este estudiante?
create or replace function public.is_my_applicant(sid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.applications a
    join public.offers o on o.id = a.offer_id
    join public.companies c on c.id = o.company_id
    where a.student_id = sid and c.owner_id = auth.uid()
  )
$$;

create or replace function public.offer_is_public(oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.offers o join public.companies c on c.id = o.company_id
    where o.id = oid and o.is_active and c.status = 'verificada'
  )
$$;

-- ---------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger companies_touch before update on public.companies for each row execute function public.touch_updated_at();
create trigger offers_touch before update on public.offers for each row execute function public.touch_updated_at();
create trigger applications_touch before update on public.applications for each row execute function public.touch_updated_at();

-- Alta de usuario: crea el perfil y valida el correo institucional
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r public.user_role;
  dom text := public.institutional_domain();
  full_name text;
begin
  r := case meta->>'role'
         when 'egresado' then 'egresado'::public.user_role
         when 'docente' then 'docente'::public.user_role
         when 'empresa' then 'empresa'::public.user_role
         else 'estudiante'::public.user_role
       end;

  if r <> 'empresa' and lower(split_part(new.email, '@', 2)) <> dom then
    raise exception 'Usa tu correo institucional @%', dom using errcode = 'P0001';
  end if;

  full_name := coalesce(meta->>'full_name', meta->>'name', '');

  insert into public.profiles (id, role, email, first_name, last_name, student_code, headline)
  values (
    new.id,
    r,
    lower(new.email),
    coalesce(nullif(meta->>'first_name', ''), split_part(full_name, ' ', 1), ''),
    coalesce(nullif(meta->>'last_name', ''), nullif(substr(full_name, length(split_part(full_name, ' ', 1)) + 2), ''), ''),
    case when r in ('estudiante', 'egresado') and split_part(new.email, '@', 1) ~ '^[0-9]{8}$'
         then split_part(new.email, '@', 1) end,
    case r when 'docente' then 'Docente de la UNAMAD'
           when 'egresado' then 'Egresado/a de la UNAMAD'
           when 'empresa' then 'Representante de empresa'
           else 'Estudiante de la UNAMAD' end
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un usuario no puede cambiar su propio rol ni su correo (solo un admin)
create or replace function public.protect_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.email is distinct from old.email)
     and not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
    new.email := old.email;
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles for each row execute function public.protect_profile();

-- Una empresa no puede autoverificarse; si edita datos sensibles vuelve a revisión
create or replace function public.protect_company()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pendiente';
    new.owner_id := auth.uid();
    new.review_note := null;
    new.interns_count := 0;
    return new;
  end if;
  new.status := case when new.ruc is distinct from old.ruc or new.legal_name is distinct from old.legal_name
                     then 'pendiente' else old.status end;
  new.owner_id := old.owner_id;
  new.review_note := old.review_note;
  new.interns_count := old.interns_count;
  return new;
end $$;
create trigger companies_protect before insert or update on public.companies for each row execute function public.protect_company();

-- Solo los administradores destacan ofertas en la portada
create or replace function public.protect_offer()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.featured := case when tg_op = 'UPDATE' then old.featured else false end;
  end if;
  return new;
end $$;
create trigger offers_protect before insert or update on public.offers for each row execute function public.protect_offer();

-- Postulaciones: el estudiante solo crea en estado 'postulado'; la empresa solo cambia el estado
create or replace function public.protect_application()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'postulado';
    new.student_id := auth.uid();
    return new;
  end if;
  if public.owns_offer(old.offer_id) then
    new.offer_id := old.offer_id; new.student_id := old.student_id;
    new.message := old.message; new.cv_path := old.cv_path;
  else
    new.status := old.status; new.offer_id := old.offer_id; new.student_id := old.student_id;
  end if;
  return new;
end $$;
create trigger applications_protect before insert or update on public.applications for each row execute function public.protect_application();

-- Historial (línea de tiempo) de cada postulación
create or replace function public.log_application_event()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.application_events (application_id, status, note) values (new.id, new.status, 'Postulación enviada');
  elsif new.status is distinct from old.status then
    insert into public.application_events (application_id, status) values (new.id, new.status);
  end if;
  return null;
end $$;
create trigger applications_log after insert or update on public.applications for each row execute function public.log_application_event();

-- Validaciones al postular: oferta pública, vigente y rol permitido
create or replace function public.check_application()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  o public.offers;
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  select * into o from public.offers where id = new.offer_id;
  if not public.offer_is_public(new.offer_id) then
    raise exception 'La oferta no está disponible.' using errcode = 'P0001';
  end if;
  if o.deadline < current_date then
    raise exception 'La convocatoria ya cerró.' using errcode = 'P0001';
  end if;
  if public.current_role_name() not in ('estudiante', 'egresado') then
    raise exception 'Solo estudiantes y egresados pueden postular.' using errcode = 'P0001';
  end if;
  if o.graduates_only and public.current_role_name() <> 'egresado' then
    raise exception 'Esta oferta es solo para egresados.' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger applications_check before insert on public.applications for each row execute function public.check_application();

-- ---------------------------------------------------------------------
-- Vistas / funciones de lectura
-- ---------------------------------------------------------------------
-- Directorio de la comunidad: solo datos no sensibles
create or replace function public.community_directory()
returns table (id uuid, role public.user_role, first_name text, last_name text, career_id text, cycle smallint,
               headline text, avatar_url text, skills text[])
language sql stable security definer set search_path = public as $$
  select p.id, p.role, p.first_name, p.last_name, p.career_id, p.cycle, p.headline, p.avatar_url, p.skills
  from public.profiles p
  where public.current_role_name() in ('estudiante', 'egresado', 'docente', 'admin') and p.role in ('estudiante', 'egresado', 'docente')
  order by p.first_name, p.last_name
$$;

create or replace function public.public_profile(pid uuid)
returns table (id uuid, role public.user_role, first_name text, last_name text, career_id text, cycle smallint,
               grad_year smallint, headline text, location text, about text, skills text[], languages jsonb,
               experience jsonb, projects jsonb, certifications jsonb, avatar_url text, cover_url text)
language sql stable security definer set search_path = public as $$
  select p.id, p.role, p.first_name, p.last_name, p.career_id, p.cycle, p.grad_year, p.headline, p.location, p.about,
         p.skills, p.languages, p.experience, p.projects, p.certifications, p.avatar_url, p.cover_url
  from public.profiles p
  where public.current_role_name() in ('estudiante', 'egresado', 'docente', 'admin') and p.id = pid and p.role in ('estudiante', 'egresado', 'docente')
$$;

-- Estadísticas de la portada (contadores públicos)
create or replace function public.portal_stats()
returns table (active_offers bigint, companies bigint, members bigint, hired bigint)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from public.offers o join public.companies c on c.id = o.company_id
      where o.is_active and c.status = 'verificada' and o.deadline >= current_date),
    (select count(*) from public.companies where status = 'verificada'),
    (select count(*) from public.profiles where role in ('estudiante', 'egresado', 'docente')),
    (select count(*) from public.applications where status = 'aceptado')
      + coalesce((select sum(interns_count) from public.companies where status = 'verificada'), 0)
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.faculties enable row level security;
alter table public.careers enable row level security;
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.offers enable row level security;
alter table public.applications enable row level security;
alter table public.application_events enable row level security;
alter table public.saved_offers enable row level security;
alter table public.connections enable row level security;
alter table public.news enable row level security;

-- Catálogos
create policy "faculties: lectura pública" on public.faculties for select using (true);
create policy "faculties: admin escribe" on public.faculties for all using (public.is_admin()) with check (public.is_admin());
create policy "careers: lectura pública" on public.careers for select using (true);
create policy "careers: admin escribe" on public.careers for all using (public.is_admin()) with check (public.is_admin());

-- Perfiles
create policy "profiles: ver el propio" on public.profiles for select using (id = auth.uid());
create policy "profiles: admin ve todo" on public.profiles for select using (public.is_admin());
create policy "profiles: empresa ve a sus postulantes" on public.profiles for select using (public.is_my_applicant(id));
create policy "profiles: editar el propio" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin edita" on public.profiles for update using (public.is_admin()) with check (public.is_admin());
create policy "profiles: admin elimina" on public.profiles for delete using (public.is_admin());

-- Empresas
create policy "companies: verificadas son públicas" on public.companies for select using (status = 'verificada');
create policy "companies: dueño ve la suya" on public.companies for select using (owner_id = auth.uid());
create policy "companies: admin ve todo" on public.companies for select using (public.is_admin());
create policy "companies: rol empresa crea" on public.companies for insert
  with check (public.current_role_name() = 'empresa' and owner_id = auth.uid()
              and not exists (select 1 from public.companies c where c.owner_id = auth.uid()));
create policy "companies: admin crea" on public.companies for insert with check (public.is_admin());
create policy "companies: dueño edita" on public.companies for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "companies: admin edita" on public.companies for update using (public.is_admin()) with check (public.is_admin());
create policy "companies: admin elimina" on public.companies for delete using (public.is_admin());

-- Ofertas
create policy "offers: públicas" on public.offers for select using (public.offer_is_public(id));
create policy "offers: dueño ve las suyas" on public.offers for select using (public.owns_company(company_id));
create policy "offers: admin ve todo" on public.offers for select using (public.is_admin());
create policy "offers: postulante ve las suyas" on public.offers for select
  using (exists (select 1 from public.applications a where a.offer_id = offers.id and a.student_id = auth.uid()));
create policy "offers: dueño verificado crea" on public.offers for insert
  with check (public.owns_company(company_id)
              and exists (select 1 from public.companies c where c.id = company_id and c.status = 'verificada'));
create policy "offers: dueño edita" on public.offers for update using (public.owns_company(company_id)) with check (public.owns_company(company_id));
create policy "offers: dueño elimina" on public.offers for delete using (public.owns_company(company_id));
create policy "offers: admin todo" on public.offers for all using (public.is_admin()) with check (public.is_admin());

-- Postulaciones
create policy "applications: estudiante ve las suyas" on public.applications for select using (student_id = auth.uid());
create policy "applications: empresa ve las de sus ofertas" on public.applications for select using (public.owns_offer(offer_id));
create policy "applications: admin ve todo" on public.applications for select using (public.is_admin());
create policy "applications: estudiante postula" on public.applications for insert with check (student_id = auth.uid());
create policy "applications: empresa cambia estado" on public.applications for update using (public.owns_offer(offer_id)) with check (public.owns_offer(offer_id));
create policy "applications: admin edita" on public.applications for update using (public.is_admin()) with check (public.is_admin());
create policy "applications: estudiante retira si está en 'postulado'" on public.applications for delete
  using (student_id = auth.uid() and status = 'postulado');

create policy "events: ver si ve la postulación" on public.application_events for select
  using (exists (select 1 from public.applications a where a.id = application_id));

-- Guardados
create policy "saved: propios" on public.saved_offers for all using (student_id = auth.uid()) with check (student_id = auth.uid());

-- Conexiones
create policy "connections: ver las mías" on public.connections for select using (from_id = auth.uid() or to_id = auth.uid());
create policy "connections: crear" on public.connections for insert with check (from_id = auth.uid());
create policy "connections: eliminar" on public.connections for delete using (from_id = auth.uid());

-- Novedades
create policy "news: lectura pública" on public.news for select using (true);
create policy "news: admin escribe" on public.news for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Storage: buckets y políticas
--   avatars        público  · {user_id}/avatar-*.jpg, {user_id}/cover-*.jpg
--   company-media  público  · {company_id}/logo-*.png, cover-*, gallery-*
--   cvs            privado  · {user_id}/cv-*.pdf
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('company-media', 'company-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('cvs', 'cvs', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "avatars: lectura pública" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: dueño sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: dueño actualiza" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: dueño elimina" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "company-media: lectura pública" on storage.objects for select using (bucket_id = 'company-media');
create policy "company-media: dueño sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'company-media' and (public.owns_company(((storage.foldername(name))[1])::uuid) or public.is_admin()));
create policy "company-media: dueño actualiza" on storage.objects for update to authenticated
  using (bucket_id = 'company-media' and (public.owns_company(((storage.foldername(name))[1])::uuid) or public.is_admin()));
create policy "company-media: dueño elimina" on storage.objects for delete to authenticated
  using (bucket_id = 'company-media' and (public.owns_company(((storage.foldername(name))[1])::uuid) or public.is_admin()));

create policy "cvs: dueño, empresa con postulación o admin leen" on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or public.is_my_applicant(((storage.foldername(name))[1])::uuid)));
create policy "cvs: dueño sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cvs: dueño actualiza" on storage.objects for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "cvs: dueño elimina" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
