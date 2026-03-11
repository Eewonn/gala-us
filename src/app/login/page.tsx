"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import GalaLogo from "@/components/GalaLogo";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<User[] | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);

    const supabase = createClient();
    const { data } = await supabase
      .from("users")
      .select("*")
      .ilike("name", `%${name.trim()}%`)
      .limit(8);

    setResults((data || []) as User[]);
    setLoading(false);
  };

  const loginAs = async (user: User) => {
    localStorage.setItem(
      "galaus_user",
      JSON.stringify({ id: user.id, name: user.name })
    );

    // If a specific redirect was requested, honour it
    if (redirectTo !== "/") {
      window.location.href = redirectTo;
      return;
    }

    // Otherwise find their most recent gala and send them there
    const supabase = createClient();
    const { data } = await supabase
      .from("gala_members")
      .select("gala_id")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false })
      .limit(1);

    const lastGalaId = data?.[0]?.gala_id as string | undefined;
    window.location.href = lastGalaId ? `/gala/${lastGalaId}` : "/";
  };

  const createAndLogin = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("users")
      .insert({ name: name.trim() })
      .select()
      .single();

    if (err || !data) {
      setError("Could not create user. Please try again.");
      setLoading(false);
      return;
    }
    loginAs(data as User);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <label className="font-black text-xs uppercase tracking-widest text-slate-400">
          Your Name
        </label>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            placeholder="e.g. Mark Eron Diaz"
            className="flex-1 h-13 px-4 border-3 border-slate-900 rounded-xl font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] placeholder:text-slate-300"
            style={{ height: "52px" }}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-[52px] px-5 bg-[#ff5833] text-white font-black rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-base">search</span>
            )}
            Search
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 text-red-700 font-bold text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="flex flex-col gap-3">
          <div className="border-t-2 border-slate-100 pt-4">
            {results.length > 0 ? (
              <>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                  Select your account
                </p>
                <div className="flex flex-col gap-2">
                  {results.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => loginAs(user)}
                      className="flex items-center gap-4 p-4 bg-[#f8f6f5] rounded-xl border-3 border-slate-200 hover:border-[#ff5833] hover:bg-[#ff5833]/5 text-left transition-all group"
                    >
                      <div className="size-11 rounded-full bg-[#ff5833] border-3 border-slate-900 flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#23130f]">
                        <span className="text-white font-black text-lg leading-none">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#ff5833] transition-colors">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-400 font-medium text-center my-4">
                  Not you?
                </p>
                <button
                  type="button"
                  onClick={createAndLogin}
                  disabled={loading}
                  className="w-full h-12 border-3 border-dashed border-slate-300 rounded-xl font-black text-slate-400 hover:border-[#ff5833] hover:text-[#ff5833] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  New account as &ldquo;{name}&rdquo;
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="size-14 rounded-full bg-slate-100 border-3 border-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-300 text-3xl">
                    search_off
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-700">No account found</p>
                  <p className="text-sm text-slate-400 font-medium mt-0.5">
                    for &ldquo;{name}&rdquo;
                  </p>
                </div>
                <button
                  type="button"
                  onClick={createAndLogin}
                  disabled={loading}
                  className="w-full h-13 bg-[#ff5833] text-white font-black rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ height: "52px" }}
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  {loading ? "Creating…" : `Start as "${name}"`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f5] flex flex-col">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-20 py-5 bg-white border-b-3 border-slate-900/10">
        <GalaLogo />
        <Link
          href="/"
          className="font-bold text-slate-500 hover:text-[#ff5833] transition-colors flex items-center gap-1.5 text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </Link>
      </header>

      {/* Main centered content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Hero text */}
          <div className="text-center mb-8">
            <div className="size-16 bg-slate-900 rounded-2xl border-3 border-slate-900 shadow-[6px_6px_0px_0px_#ff5833] mx-auto flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-white text-3xl">
                person
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Who are <span className="text-[#ff5833] italic">you?</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Search your name to pick up where you left off.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border-3 border-slate-900 shadow-[8px_8px_0px_0px_#23130f] p-7">
            <Suspense
              fallback={
                <div className="text-center py-10 text-slate-400 font-bold">
                  Loading…
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm font-bold text-slate-400">
            <Link href="/create-gala" className="hover:text-[#ff5833] transition-colors">
              Create a Gala
            </Link>
            <span>·</span>
            <Link href="/join" className="hover:text-[#ff5833] transition-colors">
              Join with Invite Code
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
