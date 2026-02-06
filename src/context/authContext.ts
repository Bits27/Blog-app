import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
