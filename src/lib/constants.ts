import type { AppStatus, CompanyStatus, OfferType, Role, WorkMode } from "./types";

export const BRAND = process.env.NEXT_PUBLIC_BRAND || "TalentoMDD";
export const UNIVERSITY = process.env.NEXT_PUBLIC_UNIVERSITY || "UNAMAD";
export const UNIVERSITY_FULL = "Universidad Nacional Amazónica de Madre de Dios";
export const DOMAIN = process.env.NEXT_PUBLIC_INSTITUTIONAL_DOMAIN || "unamad.edu.pe";
export const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_GOOGLE === "true";

export const OFFER_TYPES: Record<OfferType, { label: string; cls: string }> = {
  pre: { label: "Práctica pre-profesional", cls: "bg-primary-soft text-primary" },
  pro: { label: "Práctica profesional", cls: "bg-[#E6F0EA] text-[#2F5E4C]" },
  emp: { label: "Empleo", cls: "bg-[#FBEEDD] text-[#774700]" },
  vol: { label: "Voluntariado", cls: "bg-[#F1EAF2] text-[#683F70]" },
};

export const WORK_MODES: WorkMode[] = ["Presencial", "Híbrido", "Remoto"];

export const APP_STATUS: Record<AppStatus, { label: string; cls: string; step: number }> = {
  postulado: { label: "Postulado", cls: "bg-[#F2EAE7] text-[#5E5450]", step: 0 },
  revision: { label: "En revisión", cls: "bg-[#FBEEDD] text-[#774700]", step: 1 },
  entrevista: { label: "Entrevista", cls: "bg-primary-soft text-primary", step: 2 },
  aceptado: { label: "Aceptado", cls: "bg-success-soft text-success", step: 3 },
  rechazado: { label: "No seleccionado", cls: "bg-error-soft text-error", step: 3 },
};

export const COMPANY_STATUS: Record<CompanyStatus, { label: string; cls: string }> = {
  pendiente: { label: "En revisión", cls: "bg-warning-soft text-warning" },
  verificada: { label: "Verificada", cls: "bg-success-soft text-success" },
  rechazada: { label: "Rechazada", cls: "bg-error-soft text-error" },
};

export const ROLES: Record<Role, string> = {
  estudiante: "Estudiante",
  egresado: "Egresado/a",
  docente: "Docente",
  empresa: "Empresa",
  admin: "Administrador/a",
};

export const SECTORS = [
  "Tecnología y software", "Agroindustria", "Agroexportación", "Manejo forestal", "ONG ambiental", "Turismo y hotelería",
  "Banca y finanzas", "Telecomunicaciones", "Construcción", "Salud", "Educación", "Sector público", "Universidad pública", "Otro",
];

export const TESTIMONIALS = [
  { photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces", name: "Mariela Torres Huamán", meta: "Egresada de Ingeniería Agroindustrial, 2023", role: "Jefa de calidad en Castañera Amazónica",
    quote: "Hice mis prácticas pre-profesionales en la planta gracias a una oferta publicada aquí. A los seis meses me ofrecieron quedarme y hoy lidero el área de calidad." },
  { photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces", name: "Renzo Chávez Medina", meta: "Egresado de Ingeniería de Sistemas e Informática, 2021", role: "Desarrollador Full Stack en Selva Digital",
    quote: "La ficha de la empresa me ayudó a preparar la entrevista: sabía qué hacían, quién me iba a entrevistar y dónde quedaba la oficina." },
  { photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces", name: "Daniela Ccahuana Ríos", meta: "Egresada de Ingeniería Forestal y Medio Ambiente, 2022", role: "Analista de teledetección en SatBosque Analytics",
    quote: "Empecé como voluntaria en monitoreo de fauna y luego postulé a la práctica de SIG. Hoy trabajo de forma remota procesando imágenes satelitales del bosque." },
];

export const FAQS: [string, string][] = [
  ["¿Quiénes pueden usar la plataforma?", "Estudiantes, egresados y docentes con correo institucional, y empresas u organizaciones verificadas por la universidad."],
  ["¿Cómo sé que una empresa es confiable?", "Las empresas con la insignia «Empresa verificada» pasaron una revisión de la Oficina de Empleabilidad: RUC activo, convenio firmado y visita a sus instalaciones."],
  ["¿Las prácticas pre-profesionales son remuneradas?", "Sí. Según la Ley N.º 28518, las prácticas reciben una subvención económica mensual que no puede ser menor a una remuneración mínima vital cuando la jornada es completa. Los voluntariados no son remunerados."],
  ["¿Puedo postular a varias ofertas a la vez?", "Sí. Puedes postular a las ofertas que quieras y seguir el estado de cada una en «Mis postulaciones»."],
  ["¿Cómo publica una empresa sus ofertas?", "Crea una cuenta con el rol «Empresa». La universidad verifica sus datos en un máximo de 48 horas hábiles y luego puede publicar ofertas."],
];

// Fotos de respaldo cuando una empresa aún no sube portada
export const FALLBACK_COVER = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=70&auto=format&fit=crop";
export const HERO_PHOTO = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=70&auto=format&fit=crop";
export const AUTH_PHOTO = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&q=70&auto=format&fit=crop";
export const TEAM_PHOTO = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=70&auto=format&fit=crop";
/** Foto de cada carrera (por id); las demás usan la portada genérica */
export const CAREER_PHOTOS: Record<string, string> = {
  sis: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=70&auto=format&fit=crop",
  agro: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=70&auto=format&fit=crop",
  for: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&q=70&auto=format&fit=crop",
};
