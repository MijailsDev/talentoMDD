-- El perfil público incluye el correo institucional, para el botón «Enviar correo» de Comunidad.
-- Sigue visible solo para estudiantes, egresados, docentes y admins con sesión iniciada.
-- Cambia el tipo de retorno, así que hay que borrar la función antes de volver a crearla.
drop function if exists public.public_profile(uuid);

create function public.public_profile(pid uuid)
returns table (id uuid, role public.user_role, first_name text, last_name text, career_id text, cycle smallint,
               grad_year smallint, headline text, location text, about text, skills text[], languages jsonb,
               experience jsonb, projects jsonb, certifications jsonb, avatar_url text, cover_url text, email text)
language sql stable security definer set search_path = public as $$
  select p.id, p.role, p.first_name, p.last_name, p.career_id, p.cycle, p.grad_year, p.headline, p.location, p.about,
         p.skills, p.languages, p.experience, p.projects, p.certifications, p.avatar_url, p.cover_url, p.email
  from public.profiles p
  where public.current_role_name() in ('estudiante', 'egresado', 'docente', 'admin') and p.id = pid and p.role in ('estudiante', 'egresado', 'docente')
$$;

notify pgrst, 'reload schema';
