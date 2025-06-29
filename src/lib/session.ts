import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

export async function getCurrentUser() {
  const _cookieStore = cookies();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
