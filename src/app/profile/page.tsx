"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import GalaLogo from "@/components/GalaLogo";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import AlertDialog from "@/components/AlertDialog";
import type { User } from "@/types/database";

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [alertDialog, setAlertDialog] = useState<{isOpen: boolean; title: string; message: string; type: "error"|"success"|"warning"|"info"}>({isOpen: false, title: "", message: "", type: "error"});

  // Redirect if not logged in
  useEffect(() => {
    if (authUser === null) {
      // give context a moment to hydrate first
      const t = setTimeout(() => router.push("/login?redirect=/profile"), 300);
      return () => clearTimeout(t);
    }
  }, [authUser, router]);

  // Load user details + avatar from database
  useEffect(() => {
    if (!authUser) return;

    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();
      if (data) {
        const p = data as User;
        setProfile(p);
        setName(p.name);
        // Load avatar from database
        if (p.avatar) {
          setAvatar(p.avatar);
        }
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAlertDialog({isOpen: true, title: "Image Too Large", message: "Image must be less than 2MB", type: "warning"});
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser || !name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Update both name and avatar in database
      const { error: err } = await supabase
        .from("users")
        .update({ 
          name: name.trim(),
          avatar: avatar || null
        })
        .eq("id", authUser.id);

      if (err) {
        console.error("Failed to save profile:", err);
        throw err;
      }

      // Update auth context with new name
      localStorage.setItem(
        "galaus_user",
        JSON.stringify({ id: authUser.id, name: name.trim() })
      );
      refresh();

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!authUser || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="size-10 border-4 border-[#ff5833] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');`}</style>

      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-20 py-5 bg-card border-b-3 border-slate-900/10 dark:border-white/10">
        <GalaLogo />
        <Link
          href="/"
          className="font-bold text-slate-500 hover:text-[#ff5833] transition-colors flex items-center gap-1.5 text-sm"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight">
            Your <span className="text-[#ff5833] italic">Profile</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Update your name and profile picture.
          </p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Avatar section */}
          <div className="bg-card rounded-xl border-3 border-slate-900 dark:border-white/20 shadow-[6px_6px_0px_0px_#23130f] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] p-6 flex flex-col items-center gap-5">
            {/* Avatar preview */}
            <div className="relative">
              <div className="size-28 rounded-full bg-[#ff5833] border-4 border-slate-900 shadow-[4px_4px_0px_0px_#23130f] flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-black text-4xl">{initials || "?"}</span>
                )}
              </div>
              {/* Edit badge */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 size-9 bg-white border-3 border-slate-900 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_#23130f] hover:bg-[#ff5833] hover:text-white transition-colors group"
              >
                <span className="material-symbols-outlined text-slate-700 text-base group-hover:text-white">
                  photo_camera
                </span>
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#ff5833] text-white font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#23130f] btn-push text-sm"
              >
                <span className="material-symbols-outlined text-base">upload</span>
                Upload Photo
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white font-black rounded-xl border-2 border-slate-300 hover:border-red-400 hover:text-red-500 transition-colors btn-push text-sm"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Name section */}
          <div className="bg-card rounded-xl border-3 border-slate-900 dark:border-white/20 shadow-[6px_6px_0px_0px_#23130f] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] p-6 flex flex-col gap-4">
            <h2 className="font-black text-lg uppercase tracking-wide">Details</h2>
            <div className="flex flex-col gap-1.5">
              <label className="font-black text-xs uppercase tracking-widest text-slate-400">
                Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full h-12 px-4 border-3 border-slate-900 dark:border-white/20 rounded-xl font-semibold text-base focus:outline-none focus:border-[#ff5833] bg-background text-foreground"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-black text-xs uppercase tracking-widest text-slate-400">
                Member Since
              </label>
              <p className="font-bold text-slate-600 text-sm">
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 text-red-700 font-bold text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="h-14 bg-[#ff5833] text-white text-lg font-black rounded-xl border-3 border-slate-900 shadow-[6px_6px_0px_0px_#23130f] btn-push flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Saving…
              </>
            ) : saved ? (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                Saved!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">save</span>
                Save Changes
              </>
            )}
          </button>
        </form>
      </main>

      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        onClose={() => setAlertDialog({...alertDialog, isOpen: false})}
      />
    </div>
  );
}
