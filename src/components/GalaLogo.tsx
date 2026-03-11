import Link from "next/link";

export default function GalaLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="size-10 bg-[#ff5833] rounded-lg flex items-center justify-center bold-border shrink-0">
        <span className="material-symbols-outlined text-white font-bold text-xl leading-none">
          celebration
        </span>
      </div>
      <span className="text-2xl font-black tracking-tighter uppercase italic">
        GalaUs
      </span>
    </Link>
  );
}
