"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        
        // Check if we have a code in the URL
        const code = searchParams.get("code");
        
        if (code) {
          // Exchange the code for a session
          const { error: authError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (authError) {
            throw authError;
          }
        }

        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify session was created
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error("Failed to create session");
        }

        // Get the redirect URL or default to my-galas
        const redirect = searchParams.get("redirect") || "/my-galas";
        
        setVerifying(false);
        
        // Small delay to show success message
        setTimeout(() => {
          window.location.href = redirect;
        }, 800);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Authentication failed");
        setVerifying(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center px-6">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>
        <div className="w-full max-w-md bg-white rounded-2xl border-3 border-slate-900 shadow-[8px_8px_0px_0px_#23130f] p-8 text-center">
          <div className="size-20 rounded-full bg-red-100 border-3 border-red-400 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-red-600 text-4xl">
              error
            </span>
          </div>
          <h1 className="text-2xl font-black mb-2">Authentication Failed</h1>
          <p className="text-slate-600 font-medium mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-[#ff5833] text-white font-black rounded-xl border-3 border-slate-900 shadow-playful-sm btn-push"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center px-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>
      <div className="w-full max-w-md bg-white rounded-2xl border-3 border-slate-900 shadow-[8px_8px_0px_0px_#23130f] p-8 text-center">
        {verifying ? (
          <>
            <div className="size-20 rounded-full bg-blue-100 border-3 border-blue-400 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-blue-600 text-4xl animate-spin">
                progress_activity
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2">Logging you in...</h1>
            <p className="text-slate-600 font-medium">
              Please wait while we verify your magic link
            </p>
          </>
        ) : (
          <>
            <div className="size-20 rounded-full bg-green-100 border-3 border-green-400 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-600 text-4xl">
                check_circle
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2">Success!</h1>
            <p className="text-slate-600 font-medium">
              Redirecting you now...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f6f5] flex items-center justify-center">
          <div className="text-slate-400 font-bold">Loading...</div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
