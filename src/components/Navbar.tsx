"use client";

import Link from "next/link";
import GalaLogo from "@/components/GalaLogo";
import UserDropdown from "@/components/UserDropdown";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  showCreateButton?: boolean;
  variant?: "default" | "landing";
}

export default function Navbar({ showCreateButton = true, variant = "default" }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center px-6 md:px-20 py-6 sticky top-0 bg-[#f8f6f5]/90 backdrop-blur-md z-50 border-b-2 border-[#23130f]/10">
      <div className="flex-1">
        <GalaLogo />
      </div>
      
      {variant === "landing" && (
        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <a className="hover:text-[#ff5833] font-bold transition-colors" href="#features">
            Features
          </a>
          <a className="hover:text-[#ff5833] font-bold transition-colors" href="#how">
            How it works
          </a>
        </nav>
      )}
      
      <div className="flex items-center gap-3 flex-1 justify-end">
        {user ? (
          <>
            {showCreateButton && (
              <Link 
                href="/create-gala" 
                className="h-11 px-6 bg-[#ff5833] text-white font-black rounded-full bold-border shadow-playful-sm btn-push flex items-center justify-center text-sm"
              >
                Create a Gala
              </Link>
            )}
            <UserDropdown />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="h-11 px-5 bg-white font-black rounded-full bold-border shadow-playful-sm btn-push items-center justify-center text-sm hidden sm:flex"
            >
              Log In
            </Link>
            {showCreateButton && (
              <Link
                href="/create-gala"
                className="h-11 px-6 bg-[#ff5833] text-white font-black rounded-full bold-border shadow-playful-sm btn-push flex items-center justify-center text-sm"
              >
                Create a Gala
              </Link>
            )}
            <Link
              href="/join"
              className="h-11 px-6 bg-white font-black rounded-full bold-border shadow-playful-sm btn-push flex items-center justify-center text-sm"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
