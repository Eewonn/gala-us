"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import GalaLogo from "@/components/GalaLogo";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/my-galas";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Check for error from callback
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [user, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (authError) {
        console.error("Supabase auth error:", authError);
        throw authError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="size-20 rounded-full bg-green-100 border-3 border-green-400 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-4xl">
            mark_email_read
          </span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2">Check your email!</h2>
          <p className="text-slate-600 font-medium">
            We sent a magic link to
          </p>
          <p className="text-[#ff5833] font-black mt-1">{email}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-sm">
          <p className="font-bold text-blue-900 mb-1">What's next?</p>
          <p className="text-blue-700 font-medium">
            Click the link in your email to log in. The link expires in 1 hour.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setEmail("");
          }}
          className="text-slate-500 hover:text-[#ff5833] font-bold text-sm transition-colors"
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-black text-xs uppercase tracking-widest text-slate-400">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            placeholder="you@example.com"
            className="w-full h-13 px-4 border-3 border-slate-900 rounded-xl font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-[#f8f6f5] placeholder:text-slate-300"
            style={{ height: "52px" }}
          />
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3 text-red-700 font-bold text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full h-[52px] bg-[#ff5833] text-white font-black rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
              Sending magic link...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">mail</span>
              Send Magic Link
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
        <div className="h-px bg-slate-200 flex-1"></div>
        <span>No password needed</span>
        <div className="h-px bg-slate-200 flex-1"></div>
      </div>

      <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm">
        <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">info</span>
          How it works
        </p>
        <p className="text-slate-600 font-medium">
          Enter your email and we'll send you a magic link to log in securely. No password required!
        </p>
      </div>
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
                lock_open
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Welcome to <span className="text-[#ff5833] italic">GalaUs</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Sign in with your email to continue
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

          {/* Footer note */}
          <p className="text-center text-sm text-slate-400 font-medium mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-[#ff5833] hover:underline font-bold">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-[#ff5833] hover:underline font-bold">
              Privacy Policy
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
