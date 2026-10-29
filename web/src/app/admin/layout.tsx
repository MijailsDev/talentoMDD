import { requireRole } from "@/lib/auth";
import { AdminTabs } from "@/components/admin-tabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"], "/admin");
  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <div className="container-x pt-8">
          <p className="eyebrow">Oficina de Empleabilidad</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Administración</h1>
          <AdminTabs />
        </div>
      </div>
      <div className="container-x py-8">{children}</div>
    </>
  );
}
