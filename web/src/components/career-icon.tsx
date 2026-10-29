import { Calculator, GraduationCap, Hammer, Leaf, Megaphone, Monitor, Mountain, PawPrint, Ruler, Scale, Stethoscope, Trees, TrendingUp, Wheat } from "lucide-react";

const MAP = {
  computer: Monitor, agriculture: Wheat, forest: Trees, construction: Hammer, architecture: Ruler, monitoring: TrendingUp,
  calculate: Calculator, hiking: Mountain, pets: PawPrint, medical_services: Stethoscope, eco: Leaf, gavel: Scale, campaign: Megaphone, school: GraduationCap,
};

export const CAREER_ICON_KEYS = Object.keys(MAP);

export function CareerIcon({ icon, size = 24, className = "" }: { icon: string; size?: number; className?: string }) {
  const Icon = MAP[icon as keyof typeof MAP] ?? GraduationCap;
  return <Icon size={size} className={className} />;
}
