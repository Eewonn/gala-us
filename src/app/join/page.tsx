"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import GalaLogo from "@/components/GalaLogo";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Gala } from "@/types/database";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState(searchParams.get("code") || "");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      const currentUrl = `/join${inviteCode ? `?code=${inviteCode}` : ""}`;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, authLoading, router, inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Find gala by invite code
      const { data: galaData, error: galaErr } = await supabase
        .from("galas")
        .select("*")
        .eq("invite_code", inviteCode.trim().toLowerCase())
        .single();

      if (galaErr || !galaData) {
        throw new Error("Invalid invite code. Please check and try again.");
      }
      const gala = galaData as Gala;

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("gala_members")
        .select("id")
        .eq("gala_id", gala.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("You're already in this gala!");
      }

      // Add as member
      const { error: memberErr } = await supabase
        .from("gala_members")
        .insert({
          gala_id: gala.id,
          user_id: user.id,
          role: "member",
        });

      if (memberErr) throw memberErr;

      router.push(`/gala/${gala.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="text-center py-10 text-slate-400 font-bold">
        Loading…
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Show logged-in user info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl bold-border p-6 shadow-playful-sm flex items-center gap-4">
        <div className="size-12 rounded-full bg-[#ff5833] flex items-center justify-center bold-border">
          <span className="material-symbols-outlined text-white text-2xl">
            person
          </span>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">
            Joining as
          </p>
          <p className="text-xl font-black">{user.name || user.email}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-black text-sm uppercase tracking-wider text-slate-500">
          Invite Code
        </label>
        <input
          name="inviteCode"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          required
          placeholder="e.g. 3F7A9C2D"
            className="w-full h-12 px-4 border-3 border-slate-900 dark:border-white/20 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-background uppercase tracking-widest text-foreground"
        />
        <p className="text-xs text-slate-400 font-medium">
          Ask your gala organizer for the invite code.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 text-red-700 font-bold text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !inviteCode}
        className="h-16 bg-[#ff5833] text-white text-xl font-black rounded-xl bold-border shadow-playful btn-push flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
            Joining...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">login</span>
            Join Gala
          </>
        )}
      </button>
    </form>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-20 py-6 bg-card border-b-3 border-slate-900/10 dark:border-white/10 shadow-sm">
        <GalaLogo />
        <Link
          href="/"
          className="font-bold text-slate-500 hover:text-[#ff5833] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="size-20 bg-[#ff5833] rounded-xl bold-border shadow-playful mx-auto flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-white text-4xl font-bold">
              group_add
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            Join a <span className="text-[#ff5833] italic">Gala</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Enter your name and the invite code from your organizer.
          </p>
        </div>

        <div className="bg-card rounded-xl bold-border p-8 shadow-playful">
          <Suspense fallback={<div className="text-center py-8 text-slate-400 font-bold">Loading...</div>}>
            <JoinForm />
          </Suspense>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Don&apos;t have an invite?{" "}
          <Link
            href="/create-gala"
            className="text-[#ff5833] font-black hover:underline"
          >
            Create your own Gala
          </Link>
        </p>
      </main>
    </div>
  );
}
