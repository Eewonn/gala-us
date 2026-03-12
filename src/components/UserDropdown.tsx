"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Props {
  redirectAfterLogout?: string;
}

export default function UserDropdown({ redirectAfterLogout = "/" }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch avatar from database
  useEffect(() => {
    if (!user) return;
    
    const fetchAvatar = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("avatar")
        .eq("id", user.id)
        .single();
      
      if (data?.avatar) {
        setAvatar(data.avatar);
      }
    };
    
    fetchAvatar();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = (user.name || user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    window.location.href = redirectAfterLogout;
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 group"
        aria-expanded={open}
      >
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-xs text-slate-400 font-bold leading-none mb-0.5">
            Logged in as
          </p>
          <p className="font-black text-sm group-hover:text-[#ff5833] transition-colors leading-none">
            {user.name || user.email}
          </p>
        </div>
        <div className="size-10 rounded-full bg-[#ff5833] bold-border shadow-playful-sm flex items-center justify-center overflow-hidden group-hover:opacity-85 transition-opacity">
          {avatar ? (
            <img src={avatar} alt={user.name || user.email} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-black text-sm">{initials}</span>
          )}
        </div>
        <span className="material-symbols-outlined text-slate-400 text-base transition-transform duration-150" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          expand_more
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] w-56 bg-white border-3 border-slate-900 rounded-xl shadow-[6px_6px_0px_0px_#23130f] z-50 overflow-hidden">
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b-2 border-slate-100">
            <div className="size-10 rounded-full bg-[#ff5833] border-2 border-slate-900 flex items-center justify-center overflow-hidden shrink-0">
              {avatar ? (
                <img src={avatar} alt={user.name || user.email} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate">{user.name || user.email}</p>
              <p className="text-xs text-slate-400 font-medium">Member</p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#ff5833]/5 transition-colors group"
            >
              <span className="material-symbols-outlined text-slate-500 text-base group-hover:text-[#ff5833]">
                manage_accounts
              </span>
              <span className="font-bold text-sm text-slate-700 group-hover:text-[#ff5833]">
                View Profile
              </span>
            </Link>

            <div className="mx-3 border-t border-slate-100 my-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group"
            >
              <span className="material-symbols-outlined text-slate-400 text-base group-hover:text-red-500">
                logout
              </span>
              <span className="font-bold text-sm text-slate-500 group-hover:text-red-500">
                Log Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
