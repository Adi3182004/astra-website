import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/brand/Wordmark";
import { toast } from "sonner";
import { useSeo } from "@/lib/seo";

/** Landing page for the emailed reset link — Supabase puts a recovery session in place. */
export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const nav = useNavigate();

  useSeo({ title: "Set a new password — PRIORA by KP", canonicalPath: "/reset-password", noIndex: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters");
    if (password !== confirm) return toast.error("Both passwords must match");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    nav("/account");
  }

  const input = "w-full bg-secondary/60 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-6">
        <Link to="/" className="inline-block transition-transform hover:scale-[1.02]" aria-label="PRIORA Home">
          <Wordmark size="lg" className="text-terracotta" subClassName="text-accent font-semibold tracking-[0.32em]" />
        </Link>
      </div>

      <h1 className="font-serif text-3xl text-center mb-2">Set a new password</h1>
      <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">PRIORA by KP</p>
      {!ready ? (
        <p className="text-center text-sm text-muted-foreground">
          Open this page from the reset link we emailed you — the link signs you in so you can choose a new password.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input className={input} type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className={input} type="password" placeholder="Repeat new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <button disabled={saving} className="w-full bg-accent text-accent-foreground py-3 rounded-full text-xs uppercase tracking-widest disabled:opacity-60">
            {saving ? "Saving…" : "Save password"}
          </button>
        </form>
      )}
    </div>
  );
}
