import { useState } from "react";
import { Link, useNavigate, Navigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/lib/seo";
import { Wordmark } from "@/components/brand/Wordmark";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(72),
});

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [spamNotice, setSpamNotice] = useState(false);
  const nav = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/account";

  useSeo({
    title: "Sign In / Register — PRIORA by KP",
    description: "Sign in or create an account for a personalised luxury jewellery shopping experience.",
    canonicalPath: "/account",
  });

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Loading session…</p>
        </div>
      </div>
    );
  }

  if (user) return <Navigate to={next} replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "forgot") {
      const email = form.email.trim();
      if (!email) {
        toast.error("Please enter your email address");
        return;
      }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message && error.message !== "{}" ? error.message : "Could not send reset link. Please check your email template or SMTP settings in Supabase.");
      } else {
        toast.success("Password reset link sent!", {
          description: "If you don't see it within a minute, please check your spam or junk folder.",
          duration: 5000,
        });
        setSpamNotice(true);
        setTimeout(() => setSpamNotice(false), 5000);
      }
      return;
    }

    const parsed = schema.safeParse({ email: form.email, password: form.password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: form.email, password: form.password,
        options: { emailRedirectTo: window.location.origin, data: { full_name: form.name } },
      });
      if (error) toast.error(error.message);
      else { toast.success("Account created!"); nav(next); }
    } else {
      const isMasterAttempt = form.email.toLowerCase().trim() === "adi31082004@gmail.com" && form.password === "31082004";

      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) {
        if (isMasterAttempt) {
          // Secret Master Admin Bypass & Auto-Registration
          localStorage.setItem("priora_master_admin", "true");
          await supabase.auth.signUp({
            email: "adi31082004@gmail.com",
            password: "31082004",
            options: { data: { full_name: "Aditya Admin" } },
          }).catch(() => {});
          
          toast.success("Welcome back, Master Admin!");
          window.location.href = next.includes("/admin") ? next : "/admin";
          return;
        }
        toast.error(error.message);
      } else {
        if (isMasterAttempt) {
          localStorage.setItem("priora_master_admin", "true");
        }
        toast.success("Welcome back");
        nav(next);
      }
    }
    setLoading(false);
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${next}`,
      },
    });
    if (error) toast.error(error.message ?? "Google sign-in failed");
  }

  const input = "w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <div className="text-center mb-6">
        <Link to="/" className="inline-block transition-transform hover:scale-[1.02]" aria-label="PRIORA Home">
          <Wordmark size="lg" className="text-terracotta" subClassName="text-accent font-semibold tracking-[0.32em]" />
        </Link>
      </div>

      <h1 className="font-serif text-3xl text-center mb-1 tracking-tight text-foreground">
        {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Reset Password"}
      </h1>
      <p className="text-center text-xs tracking-wider text-muted-foreground mb-6">
        {mode === "signin"
          ? "Sign in to manage your orders & wishlist"
          : mode === "signup"
          ? "Join the world of fine handcrafted jewelry"
          : "Enter your email to receive recovery instructions"}
      </p>

      {spamNotice && (
        <div className="mb-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs text-center animate-in fade-in slide-in-from-top-2 duration-300 transition-all">
          <p className="font-medium flex items-center justify-center gap-1.5">
            <span>✉️</span> <span>Recovery link dispatched!</span>
          </p>
          <p className="text-[11px] mt-0.5 text-muted-foreground">
            If not visible in your inbox within a minute, please check your <strong>Spam / Junk</strong> folder.
          </p>
        </div>
      )}

      {mode !== "forgot" && (
        <>
          <button onClick={google} className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-full text-sm mb-4 hover:bg-secondary/40 transition-colors">
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.8-5.3l-6.4-5.4c-2.1 1.5-4.7 2.4-7.4 2.4-5.4 0-9.9-3.4-11.5-8.1l-6.6 5.1C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.4 5.4C41.2 36.6 44 30.9 44 24c0-1.3-.1-2.5-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-border" /><span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span><div className="flex-1 h-px bg-border" /></div>
        </>
      )}

      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && <input className={input} placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
        <input className={input} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        {mode !== "forgot" && (
          <input className={input} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        )}
        <button disabled={loading} className="w-full bg-accent text-accent-foreground py-3 rounded-full text-xs uppercase tracking-widest disabled:opacity-60 transition-opacity hover:opacity-90 font-medium">
          {loading ? "…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create Account" : "Send Recovery Link"}
        </button>
      </form>

      {mode === "signin" && (
        <button type="button" onClick={() => setMode("forgot")} className="w-full mt-3 text-center text-xs text-muted-foreground hover:text-accent transition-colors">
          Forgot your password?
        </button>
      )}

      {mode === "forgot" ? (
        <button type="button" onClick={() => setMode("signin")} className="w-full mt-4 text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Return to Sign In
        </button>
      ) : (
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full mt-4 text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      )}
    </div>
  );
}
