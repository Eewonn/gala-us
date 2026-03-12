"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import SqueezeLoader from "@/components/SqueezeLoader";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/my-galas";
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    // The implicit flow puts tokens in the URL hash (#access_token=...)
    // Supabase client auto-detects them via detectSessionInUrl: true
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.replace(redirect);
      }
    });

    // Also check if session already exists (in case onAuthStateChange already fired)
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.error("Auth callback error:", sessionError);
        setError(sessionError.message);
        return;
      }
      if (session) {
        router.replace(redirect);
      }
    });
  }, [router, redirect]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f5] p-4">
        <div className="bg-white rounded-2xl border-3 border-slate-900 shadow-playful p-8 max-w-md w-full text-center">
          <div className="size-16 rounded-full bg-red-100 border-3 border-red-400 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
          </div>
          <h2 className="text-xl font-black mb-2">Login Failed</h2>
          <p className="text-slate-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-[#ff5833] text-white font-black px-6 py-3 rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6f5]">
      <div className="flex flex-col items-center gap-4">
        <SqueezeLoader />
        <p className="text-slate-500 font-bold">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f6f5]">
          <SqueezeLoader />
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
