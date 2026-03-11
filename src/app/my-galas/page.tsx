"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { Gala } from "@/types/database";

export default function MyGalasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [galas, setGalas] = useState<Gala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/my-galas");
      return;
    }
    fetchUserGalas();
  }, [user, router]);

  const fetchUserGalas = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("gala_members")
        .select("gala_id, galas(*)")
        .eq("user_id", user.id);

      if (data) {
        const userGalas = data.map((item: any) => item.galas).filter(Boolean) as Gala[];
        setGalas(userGalas);
      }
    } catch (err) {
      console.error("Failed to fetch galas:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f6f5]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      <Navbar showCreateButton={true} variant="default" />

      <main className="max-w-7xl mx-auto px-6 md:px-20 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
              My <span className="text-[#ff5833]">Galas</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              All your events and adventures in one place
            </p>
          </div>
          <Link
            href="/create-gala"
            className="h-14 px-8 bg-[#ff5833] text-white font-black rounded-full bold-border shadow-playful-sm btn-push flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span className="hidden sm:inline">Create New Gala</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="size-16 border-4 border-[#ff5833] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : galas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galas.map((gala) => {
              return (
                <Link
                  key={gala.id}
                  href={`/gala/${gala.id}`}
                  className="group bg-white rounded-xl bold-border overflow-hidden shadow-playful hover:-translate-y-2 hover:shadow-playful-primary transition-all duration-200 flex flex-col"
                >
                  {/* Cover Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-[#ff5833] to-[#ff8833] relative overflow-hidden">
                    {gala.cover_image ? (
                      <img
                        src={gala.cover_image}
                        alt={gala.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-6xl opacity-30">
                          celebration
                        </span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-black uppercase backdrop-blur-sm ${
                          gala.stage === "planning"
                            ? "bg-blue-400/90 text-white"
                            : gala.stage === "confirmed"
                            ? "bg-green-400/90 text-white"
                            : gala.stage === "live"
                            ? "bg-purple-400/90 text-white"
                            : "bg-slate-400/90 text-white"
                        }`}
                      >
                        {gala.stage}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-black group-hover:text-[#ff5833] transition-colors line-clamp-2 flex-1">
                        {gala.title}
                      </h3>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[#ff5833] transition-colors flex-shrink-0">
                        arrow_forward
                      </span>
                    </div>
                    {gala.description && (
                      <p className="text-slate-600 font-medium text-sm line-clamp-3">
                        {gala.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t-2 border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-sm">
                        schedule
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        Created {new Date(gala.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl bold-border p-16 shadow-playful text-center">
            <div className="size-24 mx-auto mb-6 bg-[#ff5833]/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-[#ff5833]">
                celebration
              </span>
            </div>
            <h3 className="text-3xl font-black mb-4">No Galas Yet</h3>
            <p className="text-slate-600 font-medium text-lg mb-8 max-w-md mx-auto">
              You haven't created or joined any galas yet. Start planning your next adventure!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-gala"
                className="inline-flex h-16 px-10 bg-[#ff5833] text-white text-xl font-black rounded-xl bold-border shadow-playful btn-push items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                Create Your First Gala
              </Link>
              <Link
                href="/join"
                className="inline-flex h-16 px-10 bg-white text-xl font-black rounded-xl bold-border shadow-playful-sm btn-push items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">group_add</span>
                Join with Code
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
