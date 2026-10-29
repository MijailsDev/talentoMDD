export type Role = "estudiante" | "egresado" | "docente" | "empresa" | "admin";
export type OfferType = "pre" | "pro" | "emp" | "vol";
export type WorkMode = "Presencial" | "Remoto" | "Híbrido";
export type AppStatus = "postulado" | "revision" | "entrevista" | "aceptado" | "rechazado";
export type CompanyStatus = "pendiente" | "verificada" | "rechazada";

export type Faculty = { id: string; name: string };
export type Career = { id: string; faculty_id: string; name: string; icon: string };

export type Experience = { title: string; org: string; period: string; description: string };
export type Project = { name: string; description: string; url: string };
export type Certification = { name: string; issuer: string; year: string };
export type Language = { name: string; level: string };

export type Profile = {
  id: string;
  role: Role;
  first_name: string;
  last_name: string;
  email: string;
  student_code: string | null;
  phone: string | null;
  career_id: string | null;
  cycle: number | null;
  grad_year: number | null;
  headline: string;
  location: string;
  about: string;
  skills: string[];
  languages: Language[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  avatar_url: string | null;
  cover_url: string | null;
  cv_path: string | null;
  cv_name: string | null;
  created_at: string;
};

export type GalleryItem = { label: string; url: string };

export type Company = {
  id: string;
  slug: string;
  owner_id: string | null;
  status: CompanyStatus;
  name: string;
  short_name: string;
  legal_name: string;
  ruc: string;
  sector: string;
  logo_text: string;
  color: string;
  description: string;
  address: string;
  reference: string;
  district: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  email: string;
  website: string;
  social: string;
  hours: string;
  rep_name: string;
  rep_role: string;
  rep_email: string;
  rep_phone: string;
  rep_photo_url: string | null;
  since_year: number;
  interns_count: number;
  logo_url: string | null;
  cover_url: string | null;
  gallery: GalleryItem[];
  review_note: string | null;
  created_at: string;
};

export type Offer = {
  id: string;
  company_id: string;
  type: OfferType;
  title: string;
  mode: WorkMode;
  place: string | null;
  career_ids: string[];
  min_cycle: number | null;
  graduates_only: boolean;
  pay: string;
  paid: boolean;
  vacancies: number;
  deadline: string;
  description: string;
  functions: string[];
  skills: string[];
  languages: string[];
  documents: string[];
  benefits: string[];
  schedule: string;
  duration: string;
  start_text: string;
  stages: string[];
  featured: boolean;
  is_active: boolean;
  created_at: string;
};

export type OfferWithCompany = Offer & { company: Company };

export type Application = {
  id: string;
  offer_id: string;
  student_id: string;
  status: AppStatus;
  message: string;
  cv_path: string | null;
  created_at: string;
  updated_at: string;
};

export type ApplicationEvent = { id: number; application_id: string; status: AppStatus; note: string; created_at: string };

export type News = { id: number; event_date: string; title: string; body: string };

export type FormState = { error?: string; ok?: string; fields?: Record<string, string> } | undefined;
