import { supabase } from "./supabase";

export async function getMyUsername() {
const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return null;
  return data?.username ?? null;
}

export async function getMyUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
