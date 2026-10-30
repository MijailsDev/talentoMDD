"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function markAllNotificationsRead() {
  const s = await requireUser("/notificaciones");
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", s.uid).is("read_at", null);
  revalidatePath("/", "layout");
}

export async function clearReadNotifications() {
  const s = await requireUser("/notificaciones");
  const supabase = await createClient();
  await supabase.from("notifications").delete().eq("user_id", s.uid).not("read_at", "is", null);
  revalidatePath("/", "layout");
}
