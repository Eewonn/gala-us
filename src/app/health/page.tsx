"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function HealthCheckPage() {
  const [checks, setChecks] = useState({
    supabase: { status: "checking", message: "" },
    database: { status: "checking", message: "" },
    env: { status: "checking", message: "" },
  });

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    // Check environment variables
    const envCheck = {
      status: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "success" : "error",
      message: process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? "Environment variables configured" 
        : "Missing SUPABASE_URL or ANON_KEY",
    };

    setChecks(prev => ({ ...prev, env: envCheck }));

    if (envCheck.status === "error") {
      setChecks(prev => ({
        ...prev,
        supabase: { status: "error", message: "Cannot check - env vars missing" },
        database: { status: "error", message: "Cannot check - env vars missing" },
      }));
      return;
    }

    // Check Supabase connection
    try {
      const supabase = createClient();
      
      // Test database read
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .limit(1);

      if (error) {
        setChecks(prev => ({
          ...prev,
          supabase: { status: "error", message: `Connection failed: ${error.message}` },
          database: { status: "error", message: error.message },
        }));
      } else {
        setChecks(prev => ({
          ...prev,
          supabase: { status: "success", message: "Connected successfully" },
          database: { status: "success", message: "Database accessible" },
        }));
      }
    } catch (err) {
      setChecks(prev => ({
        ...prev,
        supabase: { status: "error", message: "Connection error" },
        database: { status: "error", message: err instanceof Error ? err.message : "Unknown error" },
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "check_circle";
      case "error":
        return "cancel";
      default:
        return "pending";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const allGood = Object.values(checks).every(check => check.status === "success");

  return (
    <div className="min-h-screen bg-[#f8f6f5] p-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-xl bold-border p-8 shadow-playful">
          <div className="flex items-center gap-4 mb-8">
            <div className={`size-16 rounded-full flex items-center justify-center ${allGood ? 'bg-green-100' : 'bg-yellow-100'}`}>
              <span className={`material-symbols-outlined text-3xl ${allGood ? 'text-green-600' : 'text-yellow-600'}`}>
                {allGood ? 'verified' : 'troubleshoot'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-black">System Health Check</h1>
              <p className="text-slate-600 font-medium">Verifying production readiness</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(checks).map(([key, check]) => (
              <div key={key} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                <span className={`material-symbols-outlined text-2xl ${getStatusColor(check.status)}`}>
                  {getStatusIcon(check.status)}
                </span>
                <div className="flex-1">
                  <div className="font-black text-lg capitalize">{key}</div>
                  <div className="text-sm text-slate-600 font-medium">{check.message}</div>
                </div>
              </div>
            ))}
          </div>

          {allGood ? (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-green-600 mb-2">celebration</span>
              <h3 className="text-xl font-black text-green-900 mb-2">All Systems Go!</h3>
              <p className="text-green-700 font-medium mb-4">
                Your app is ready for production deployment
              </p>
              <Link
                href="/"
                className="inline-flex h-12 px-6 bg-[#ff5833] text-white font-black rounded-full bold-border shadow-playful-sm btn-push items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">home</span>
                Go to App
              </Link>
            </div>
          ) : (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
              <h3 className="text-xl font-black text-yellow-900 mb-2">Action Required</h3>
              <p className="text-yellow-700 font-medium mb-4">
                Please fix the issues above before deploying to production.
              </p>
              <ul className="text-sm text-yellow-700 font-medium space-y-2 list-disc list-inside">
                {checks.env.status === "error" && (
                  <li>Add Supabase credentials to .env.local</li>
                )}
                {checks.supabase.status === "error" && (
                  <li>Verify Supabase URL and anon key are correct</li>
                )}
                {checks.database.status === "error" && (
                  <li>Run supabase/schema.sql in your Supabase SQL editor</li>
                )}
              </ul>
              <button
                onClick={runHealthChecks}
                className="mt-4 h-10 px-6 bg-yellow-600 text-white font-black rounded-full bold-border shadow-playful-sm btn-push inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry Checks
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t-2 border-slate-200 text-center">
            <p className="text-sm text-slate-600 font-medium">
              📖 See <a href="/PRODUCTION_GUIDE.md" className="text-[#ff5833] font-bold hover:underline">PRODUCTION_GUIDE.md</a> for deployment instructions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
