"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import GalaLogo from "@/components/GalaLogo";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

function SetupNameForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refresh } = useAuth();
  const redirect = searchParams.get("redirect") || "/my-galas";
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);

    const supabase = createClient();
    await supabase
      .from("users")
      .update({ name: name.trim() })
      .eq("id", user.id);

    await refresh();
    router.replace(redirect);
  };

  const handleSkip = () => {
    router.replace(redirect);
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-muted-foreground font-bold">Loading…</div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="font-black text-xs uppercase tracking-widest text-muted-foreground">
            What should we call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            placeholder="Your display name"
            className="w-full h-13 px-4 border-3 border-slate-900 dark:border-white/20 rounded-xl font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-background text-foreground placeholder:text-slate-300 dark:placeholder:text-slate-600"
            style={{ height: "52px" }}
          />
          <p className="text-xs text-muted-foreground font-medium">
            This is how other members will see you.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full h-[52px] bg-[#ff5833] text-white font-black rounded-xl border-3 border-slate-900 dark:border-white/20 shadow-playful-sm btn-push disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">check</span>
              Continue
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={handleSkip}
        className="text-muted-foreground hover:text-[#ff5833] font-bold text-sm transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

export default function SetupNamePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      <header className="flex items-center justify-center px-6 md:px-20 py-5 bg-card border-b-3 border-slate-900/10 dark:border-white/10">
        <GalaLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="size-16 bg-[#ff5833] rounded-2xl border-3 border-slate-900 dark:border-white/20 shadow-[6px_6px_0px_0px_#23130f] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] mx-auto flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white text-3xl">
                waving_hand
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
              Welcome to <span className="text-[#ff5833] italic">GalaUs!</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Set your display name so your friends know it's you.
            </p>
          </div>

          <div className="bg-card rounded-2xl border-3 border-slate-900 dark:border-white/20 shadow-[8px_8px_0px_0px_#23130f] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-7">
            <Suspense fallback={<div className="text-center py-10 text-muted-foreground font-bold">Loading…</div>}>
              <SetupNameForm />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
