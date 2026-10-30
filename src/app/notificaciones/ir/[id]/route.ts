import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Abre una notificación: la marca como leída y lleva a su destino
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", Number(id))
    .select("link")
    .maybeSingle<{ link: string }>();
  revalidatePath("/", "layout");
  const link = data?.link?.startsWith("/") && !data.link.startsWith("//") ? data.link : "/notificaciones";
  return NextResponse.redirect(new URL(link, request.url));
}
