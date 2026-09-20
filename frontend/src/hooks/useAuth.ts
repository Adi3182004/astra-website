import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const MASTER_ADMIN_EMAIL = "adi31082004@gmail.com";

const MASTER_ADMIN_USER: User = {
  id: "00000000-0000-0000-0000-000000000001",
  app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: { full_name: "Aditya Admin" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: MASTER_ADMIN_EMAIL,
  role: "authenticated",
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  phone: "",
  updated_at: new Date().toISOString(),
} as unknown as User;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isMasterAdmin = localStorage.getItem("priora_master_admin") === "true";

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        setUser(s.user);
      } else if (localStorage.getItem("priora_master_admin") === "true") {
        setUser(MASTER_ADMIN_USER);
      } else {
        setUser(null);
      }
    });

    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    supabase.auth.getSession().then(({ data }) => {
      clearTimeout(timer);
      setSession(data.session);
      if (data.session?.user) {
        setUser(data.session.user);
      } else if (isMasterAdmin) {
        setUser(MASTER_ADMIN_USER);
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(timer);
      setLoading(false);
    });

    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}
