// Verifica la migración, el seed y las políticas RLS en un Postgres embebido (PGlite).
// Simula los esquemas `auth` y `storage` de Supabase. Uso: npm run db:verify
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', 'supabase');
const db = new PGlite();
process.on('unhandledRejection', e => { console.error('✘ Error SQL:', e.message, e.where ? `\n  en: ${e.where}` : ''); process.exit(1); });

await db.exec(`
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant usage on schema auth, storage to anon, authenticated;
  grant select, insert, update, delete on storage.objects to authenticated;
`);

for (const f of readdirSync(join(root, 'migrations')).sort()) {
  await db.exec(readFileSync(join(root, 'migrations', f), 'utf8'));
}
await db.exec(`
  grant usage on schema public to anon, authenticated;
  grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  grant usage on all sequences in schema public to anon, authenticated;
`);
const seed = readFileSync(join(root, 'seed.sql'), 'utf8');
await db.exec(seed);
await db.exec(seed); // debe poder ejecutarse dos veces

let failed = 0;
const ok = (cond, msg) => { console.log(`${cond ? '✔' : '✘'} ${msg}`); if (!cond) failed++; };
const rejects = async (fn, msg) => { try { await fn(); ok(false, msg); } catch { ok(true, msg); } };
const as = async (uid, fn) => {
  await db.exec(`set role ${uid ? 'authenticated' : 'anon'}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [uid || '']);
  try { return await fn(); } finally { await db.exec('reset role'); await db.query(`select set_config('request.jwt.claim.sub', '', false)`); }
};
const one = async (sql, p) => (await db.query(sql, p)).rows[0];
const signup = async (email, meta) => (await one(`insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`, [email, meta])).id;

// --- Datos ---
ok((await one('select count(*)::int n from public.offers')).n === 16, 'seed: 16 ofertas');
ok((await one('select count(*)::int n from public.companies')).n === 11, 'seed: 11 empresas');

// --- Registro ---
await rejects(() => signup('alguien@gmail.com', { role: 'estudiante' }), 'registro: estudiante con correo no institucional es rechazado');
const student = await signup('23221001@unamad.edu.pe', { role: 'estudiante', first_name: 'Alex', last_name: 'Cruz' });
const p = await one('select * from public.profiles where id = $1', [student]);
ok(p.role === 'estudiante' && p.student_code === '23221001', 'registro: perfil creado con código de estudiante');
const student2 = await signup('23221021@unamad.edu.pe', { role: 'estudiante' });
const empUser = await signup('rrhh@empresa.pe', { role: 'empresa', first_name: 'Rosa' });
const admin = await signup('admin@unamad.edu.pe', { role: 'docente' });
await db.query(`update public.profiles set role = 'admin' where id = $1`, [admin]);

// --- Lectura pública ---
ok((await as(null, () => one('select count(*)::int n from public.offers'))).n === 16, 'anon: ve las 16 ofertas públicas');
ok((await as(null, () => one('select count(*)::int n from public.profiles'))).n === 0, 'anon: no ve perfiles');
ok((await as(student, () => one('select count(*)::int n from public.profiles'))).n === 1, 'estudiante: solo ve su propio perfil');
ok((await as(student, () => db.query('select * from public.community_directory()'))).rows.length === 2, 'comunidad: directorio muestra estudiantes (no admins ni empresas)');

ok((await as(empUser, () => db.query('select * from public.community_directory()'))).rows.length === 0, 'comunidad: una empresa no ve el directorio');

// --- Rol protegido ---
await as(student, () => db.query(`update public.profiles set role = 'admin', headline = 'Hola' where id = $1`, [student]));
const p2 = await one('select role, headline from public.profiles where id = $1', [student]);
ok(p2.role === 'estudiante' && p2.headline === 'Hola', 'perfil: no puede autoasignarse admin, sí editar datos');

// --- Empresa nueva ---
const newCo = await as(empUser, () => one(`insert into public.companies (slug, owner_id, status, name, short_name, legal_name, ruc, sector)
  values ('mi-empresa', $1, 'verificada', 'Mi Empresa', 'Mi Empresa', 'Mi Empresa S.A.C.', '20123456789', 'Servicios') returning id, status`, [empUser]));
ok(newCo.status === 'pendiente', 'empresa: se crea como pendiente aunque intente verificarse');
await rejects(() => as(empUser, () => db.query(`insert into public.companies (slug, owner_id, name, short_name, legal_name, ruc, sector)
  values ('otra', $1, 'X', 'X', 'X', '20123456780', 'X')`, [empUser])), 'empresa: no puede crear una segunda empresa');
await rejects(() => as(student, () => db.query(`insert into public.companies (slug, owner_id, name, short_name, legal_name, ruc, sector)
  values ('est', $1, 'X', 'X', 'X', '20123456781', 'X')`, [student])), 'estudiante: no puede crear empresas');
const offerSql = `insert into public.offers (company_id, type, title, deadline, career_ids, featured) values ($1, 'pre', 'Practicante', current_date + 10, '{sis}', true) returning id, featured`;
await rejects(() => as(empUser, () => db.query(offerSql, [newCo.id])), 'empresa pendiente: no puede publicar ofertas');
ok((await as(null, () => one(`select count(*)::int n from public.companies where slug = 'mi-empresa'`))).n === 0, 'empresa pendiente: no es pública');

await as(admin, () => db.query(`update public.companies set status = 'verificada' where id = $1`, [newCo.id]));
const myOffer = await as(empUser, () => one(offerSql, [newCo.id]));
ok(myOffer.featured === false, 'empresa verificada: publica oferta, pero no puede destacarla');

// --- Postulación ---
const app = await as(student, () => one(`insert into public.applications (offer_id, student_id, status) values ($1, $2, 'aceptado') returning id, status`, [myOffer.id, student]));
ok(app.status === 'postulado', 'postulación: siempre inicia como "postulado"');
await rejects(() => as(student, () => db.query(`insert into public.applications (offer_id, student_id) values ($1, $2)`, [myOffer.id, student])), 'postulación: no se duplica');
const closed = await one(`update public.offers set deadline = current_date - 1 where title = 'Practicante de inventario forestal' returning id`);
await rejects(() => as(student, () => db.query(`insert into public.applications (offer_id, student_id) values ($1, $2)`, [closed.id, student])), 'postulación: rechazada si la convocatoria cerró');
const grad = await one(`select id from public.offers where graduates_only and deadline >= current_date limit 1`);
await rejects(() => as(student, () => db.query(`insert into public.applications (offer_id, student_id) values ($1, $2)`, [grad.id, student])), 'postulación: estudiante no postula a oferta solo para egresados');
await rejects(() => as(empUser, () => db.query(`insert into public.applications (offer_id, student_id) values ($1, $2)`, [myOffer.id, empUser])), 'postulación: una empresa no puede postular');

ok((await as(empUser, () => db.query('select * from public.profiles where id = $1', [student]))).rows.length === 1, 'empresa: ve el perfil de su postulante');
ok((await as(empUser, () => db.query('select * from public.profiles where id = $1', [student2]))).rows.length === 0, 'empresa: no ve perfiles de quienes no postularon');
ok((await as(student2, () => db.query('select * from public.applications'))).rows.length === 0, 'otro estudiante: no ve postulaciones ajenas');

await as(student, () => db.query(`update public.applications set status = 'aceptado' where id = $1`, [app.id]));
ok((await one('select status from public.applications where id = $1', [app.id])).status === 'postulado', 'postulación: el estudiante no cambia su estado');
await as(empUser, () => db.query(`update public.applications set status = 'entrevista' where id = $1`, [app.id]));
const ev = await as(student, () => db.query('select status from public.application_events where application_id = $1 order by id', [app.id]));
ok(ev.rows.map(r => r.status).join(',') === 'postulado,entrevista', 'línea de tiempo: registra cada cambio de estado');

// --- Storage (CV) ---
await as(student, () => db.query(`insert into storage.objects (bucket_id, name) values ('cvs', $1)`, [`${student}/cv.pdf`]));
await rejects(() => as(student2, () => db.query(`insert into storage.objects (bucket_id, name) values ('cvs', $1)`, [`${student}/x.pdf`])), 'storage: nadie sube CV en carpeta ajena');
ok((await as(empUser, () => db.query(`select * from storage.objects where bucket_id = 'cvs'`))).rows.length === 1, 'storage: la empresa lee el CV de su postulante');
ok((await as(student2, () => db.query(`select * from storage.objects where bucket_id = 'cvs'`))).rows.length === 0, 'storage: otro estudiante no lee CVs ajenos');

// --- Inactivar ---
await as(empUser, () => db.query('update public.offers set is_active = false where id = $1', [myOffer.id]));
ok((await as(student2, () => db.query('select id from public.offers where id = $1', [myOffer.id]))).rows.length === 0, 'oferta inactiva: deja de ser pública');
ok((await as(student, () => db.query('select id from public.offers where id = $1', [myOffer.id]))).rows.length === 1, 'oferta inactiva: el postulante aún la ve en su historial');

const stats = await as(null, () => one('select * from public.portal_stats()'));
ok(Number(stats.active_offers) > 0 && Number(stats.companies) === 12, 'portal_stats: contadores públicos');

console.log(failed ? `\n${failed} verificación(es) fallaron` : '\nTodo correcto');
process.exit(failed ? 1 : 0);
