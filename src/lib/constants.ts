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

export const FAQS: [string, string][] = [
  ["¿Quiénes pueden usar la plataforma?", "Estudiantes, egresados y docentes con correo institucional, y empresas u organizaciones verificadas por la universidad."],
  ["¿Cómo sé que una empresa es confiable?", "Las empresas con la insignia «Empresa verificada» pasaron una revisión de la Oficina de Empleabilidad: RUC activo, convenio firmado y visita a sus instalaciones."],
  ["¿Las prácticas pre-profesionales son remuneradas?", "Sí. Según la Ley N.º 28518, las prácticas reciben una subvención económica mensual que no puede ser menor a una remuneración mínima vital cuando la jornada es completa. Los voluntariados no son remunerados."],
  ["¿Puedo postular a varias ofertas a la vez?", "Sí. Puedes postular a las ofertas que quieras y seguir el estado de cada una en «Mis postulaciones»."],
  ["¿Cómo publica una empresa sus ofertas?", "Crea una cuenta con el rol «Empresa». La universidad verifica sus datos en un máximo de 48 horas hábiles y luego puede publicar ofertas."],
];

// Fotos de respaldo cuando una empresa aún no sube portada
export const FALLBACK_COVER = "/fotos/portada-default.jpg";
export const HERO_PHOTO = "/fotos/heroe.jpg";
export const AUTH_PHOTO = "/fotos/acceso.jpg";
export const TEAM_PHOTO = "/fotos/empresas.jpg";
/** Foto de cada carrera (por id); las demás usan la portada genérica */
export const CAREER_PHOTOS: Record<string, string> = {
  sis: "/fotos/carrera-sistemas.jpg",
  agro: "/fotos/carrera-agro.jpg",
  for: "/fotos/carrera-forestal.jpg",
};
