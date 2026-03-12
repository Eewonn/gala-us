"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GalaLogo from "@/components/GalaLogo";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { User, Gala } from "@/types/database";

const DECISION_TYPES = [
  {
    value: "majority",
    label: "Majority Vote",
    desc: "The option with the most votes wins.",
    icon: "how_to_vote",
    color: "bg-blue-100 border-blue-400 text-blue-700",
  },
  {
    value: "organizer",
    label: "Organizer Decides",
    desc: "You make the final call after hearing suggestions.",
    icon: "person_check",
    color: "bg-green-100 border-green-400 text-green-700",
  },
  {
    value: "random",
    label: "Random Picker",
    desc: "Let fate decide from the top suggestions.",
    icon: "casino",
    color: "bg-purple-100 border-purple-400 text-purple-700",
  },
] as const;

export default function CreateGalaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    organizerName: "",
    title: "",
    description: "",
    decisionType: "majority" as "organizer" | "majority" | "random",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && !form.organizerName) return;
    if (!form.title) return;
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      let userId: string;

      if (user) {
        // Use existing logged-in user
        userId = user.id;
      } else {
        // Create user by name (MVP: name-based identity)
        const { data: userData, error: userErr } = await supabase
          .from("users")
          .insert({ name: form.organizerName })
          .select()
          .single();

        if (userErr) throw userErr;
        const newUser = userData as User;
        userId = newUser.id;

        // Store current user in localStorage for MVP
        localStorage.setItem(
          "galaus_user",
          JSON.stringify({ id: newUser.id, name: newUser.name })
        );
      }

      // Create gala
      const { data: galaData, error: galaErr } = await supabase
        .from("galas")
        .insert({
          title: form.title,
          description: form.description || null,
          organizer_id: userId,
          decision_type: form.decisionType,
        })
        .select()
        .single();

      if (galaErr) throw galaErr;
      const gala = galaData as Gala;

      // Add organizer as member
      await supabase.from("gala_members").insert({
        gala_id: gala.id,
        user_id: userId,
        role: "organizer",
      });

      router.push(`/gala/${gala.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6f5]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-20 py-6 bg-white bold-border-2 border-x-0 border-t-0 shadow-sm">
        <GalaLogo />
        <Link
          href="/"
          className="font-bold text-slate-500 hover:text-[#ff5833] transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex px-3 py-1 bg-[#ff5833]/10 border-2 border-[#ff5833] text-[#ff5833] font-bold rounded-full text-sm mb-4">
            Step 1 of 1
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            Create a{" "}
            <span className="text-[#ff5833] italic">Gala</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Set up your outing and invite your crew.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Show logged-in user info */}
          {user && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl bold-border p-6 shadow-playful-sm flex items-center gap-4">
              <div className="size-12 rounded-full bg-[#ff5833] flex items-center justify-center bold-border">
                <span className="material-symbols-outlined text-white text-2xl">
                  person
                </span>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-slate-500">
                  Creating as
                </p>
                <p className="text-xl font-black">{user.name}</p>
              </div>
            </div>
          )}

          {/* Organizer name - only show if not logged in */}
          {!user && (
            <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm flex flex-col gap-4">
              <h2 className="text-xl font-black uppercase tracking-wide">
                Your Name
              </h2>
              <input
                name="organizerName"
                value={form.organizerName}
                onChange={handleChange}
                required
                placeholder="e.g. Alex Chen"
                className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
              />
            </div>
          )}

          {/* Gala details */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm flex flex-col gap-4">
            <h2 className="text-xl font-black uppercase tracking-wide">
              Gala Details
            </h2>
            <div className="flex flex-col gap-2">
              <label className="font-black text-sm uppercase tracking-wider text-slate-500">
                Gala Name *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Summer Rooftop Bash"
                className="w-full h-12 px-4 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-black text-sm uppercase tracking-wider text-slate-500">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="What's the vibe? What are you planning?"
                className="w-full px-4 py-3 border-3 border-slate-900 rounded-lg font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] resize-none"
              />
            </div>
          </div>

          {/* Decision type */}
          <div className="bg-white rounded-xl bold-border p-6 shadow-playful-sm flex flex-col gap-4">
            <h2 className="text-xl font-black uppercase tracking-wide">
              Decision Mode
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              How will your group make decisions on suggestions?
            </p>
            <div className="grid grid-cols-1 gap-3">
              {DECISION_TYPES.map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, decisionType: dt.value }))
                  }
                  className={`flex items-center gap-4 p-4 rounded-xl border-3 text-left transition-all ${
                    form.decisionType === dt.value
                      ? "border-[#ff5833] bg-[#ff5833]/5 shadow-playful-primary-sm"
                      : "border-slate-300 hover:border-slate-900"
                  }`}
                >
                  <div
                    className={`size-12 rounded-lg flex items-center justify-center border-2 shrink-0 ${dt.color}`}
                  >
                    <span className="material-symbols-outlined text-xl font-bold">
                      {dt.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-black">{dt.label}</p>
                    <p className="text-sm text-slate-500 font-medium">
                      {dt.desc}
                    </p>
                  </div>
                  {form.decisionType === dt.value && (
                    <span className="material-symbols-outlined text-[#ff5833] ml-auto">
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 text-red-700 font-bold text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!user && !form.organizerName) || !form.title}
            className="h-16 bg-[#ff5833] text-white text-xl font-black rounded-xl bold-border shadow-playful btn-push flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">celebration</span>
                Create Gala
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
