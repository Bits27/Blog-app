import { supabase } from "./supabase";

export async function signUp(email: string, password: string, username: string) {
  const normalizedUsername = username.trim();
  if (!normalizedUsername) {
    return { user: null, error: new Error("Username is required") };
  }

  const { data: existing, error: existsError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", normalizedUsername)
    .maybeSingle();

  if (existsError) return { user: null, error: existsError };
  if (existing) {
    return { user: null, error: new Error("Username already taken") };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });//creates user 

  if (error) return { user: null, error };

  const user = data.user;
  if (!user) return { user: null, error: new Error("Signup failed: no user returned") };

  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: user.id, username: normalizedUsername }); //creates user in "profiles"

  if (profileError) return { user: null, error: profileError };

  return { user, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { user: data.user, error };
}

export async function signOut() {
  await supabase.auth.signOut();
}
