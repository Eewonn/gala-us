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
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // With implicit flow, tokens are in the URL hash (#access_token=...)
        // The Supabase client auto-detects via detectSessionInUrl: true,
        // but we need to wait for it to process.
        
        // First, check if there's a hash with tokens
        const hash = window.location.hash;
        if (hash && hash.includes("access_token")) {
          // Give the Supabase client a moment to process the hash
          // Then verify the session was established
          let attempts = 0;
          const maxAttempts = 20;
          
          while (attempts < maxAttempts) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              router.replace(redirect);
              return;
            }
            // Wait 250ms before checking again
            await new Promise(resolve => setTimeout(resolve, 250));
            attempts++;
          }
          
          // If we get here, session was never established
          setError("Login timed out. Please try requesting a new magic link.");
          return;
        }

        // No hash tokens — check if already signed in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          return;
        }
        if (session) {
          router.replace(redirect);
          return;
        }
        
        // No session found at all
        setError("No login session found. Please request a new magic link.");
      } catch (err: unknown) {
        console.error("Auth callback error:", err);
        setError("Something went wrong. Please try again.");
      }
    };

    handleCallback();
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
