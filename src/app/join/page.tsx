"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import GalaLogo from "@/components/GalaLogo";
import { createClient } from "@/lib/supabase/client";
import type { Gala, User } from "@/types/database";

function JoinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    inviteCode: searchParams.get("code") || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.inviteCode) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Find gala by invite code
      const { data: galaData, error: galaErr } = await supabase
        .from("galas")
        .select("*")
        .eq("invite_code", form.inviteCode.trim().toLowerCase())
        .single();

      if (galaErr || !galaData) {
        throw new Error("Invalid invite code. Please check and try again.");
      }
      const gala = galaData as Gala;

      // Create user
      const { data: userData, error: userErr } = await supabase
        .from("users")
        .insert({ name: form.name })
        .select()
        .single();

      if (userErr) throw userErr;
      const user = userData as User;

      // Add as member (ignore if already member)
      await supabase.from("gala_members").upsert({
        gala_id: gala.id,
        user_id: user.id,
        role: "member",
      });

      // Store user in localStorage
      localStorage.setItem(
        "galaus_user",
        JSON.stringify({ id: user.id, name: user.name })
      );

      router.push(`/gala/${gala.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="font-black text-sm uppercase tracking-wider text-slate-500">
          Your Name
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="e.g. Jamie Lee"
          className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-black text-sm uppercase tracking-wider text-slate-500">
          Invite Code
        </label>
        <input
          name="inviteCode"
          value={form.inviteCode}
          onChange={handleChange}
          required
          placeholder="e.g. 3F7A9C2D"
          className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] uppercase tracking-widest"
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
        disabled={loading || !form.name || !form.inviteCode}
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
    <div className="min-h-screen bg-[#f8f6f5]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-20 py-6 bg-white border-b-3 border-slate-900/10 shadow-sm">
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

        <div className="bg-white rounded-xl bold-border p-8 shadow-playful">
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
