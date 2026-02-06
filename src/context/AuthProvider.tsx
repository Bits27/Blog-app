import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./authContext";
import type { AuthState } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState["user"]>(null);
  const [session, setSession] = useState<AuthState["session"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setUser(null);
        setSession(null);
      } else {
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, session, loading }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
