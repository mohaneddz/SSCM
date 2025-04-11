"use server";

import { createClient } from "@/lib/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
}
