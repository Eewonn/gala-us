"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  redirectAfterLogout?: string;
}

export default function UserDropdown({ redirectAfterLogout = "/" }: Props) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Avatar: use saved base64 from localStorage if available
  const savedAvatar =
    typeof window !== "undefined"
      ? localStorage.getItem(`galaus_avatar_${user.id}`)
      : null;

  const handleLogout = () => {
    setOpen(false);
    logout();
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
            {user.name}
          </p>
        </div>
        <div className="size-10 rounded-full bg-[#ff5833] bold-border shadow-playful-sm flex items-center justify-center overflow-hidden group-hover:opacity-85 transition-opacity">
          {savedAvatar ? (
            <img src={savedAvatar} alt={user.name} className="w-full h-full object-cover" />
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
              {savedAvatar ? (
                <img src={savedAvatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm truncate">{user.name}</p>
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
