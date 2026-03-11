"use client";

import React from "react";

interface SqueezeLoaderProps {
  size?: number;
  color1?: string;
  color2?: string;
  spinDuration?: number;
  squeezeDuration?: number;
  className?: string;
  containerClassName?: string;
}

const SqueezeLoader = ({
  size = 60,
  color1 = "#ff5833",
  color2 = "#23130f",
  spinDuration = 10,
  squeezeDuration = 3,
  className = "",
  containerClassName = "",
}: SqueezeLoaderProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen w-screen bg-[#f8f6f5] gap-6 ${containerClassName}`}
    >
      <div className={`flex justify-center ${className}`}>
        <div
          className="relative"
          style={
            {
              "--color1": color1,
              "--color2": color2,
              "--spin-duration": `${spinDuration}s`,
              "--squeeze-duration": `${squeezeDuration}s`,
              width: `${size}px`,
              height: `${size}px`,
              animation: "galaus-spin var(--spin-duration) infinite linear",
            } as React.CSSProperties
          }
        >
          <div
            className="absolute"
            style={{
              background: "var(--color1)",
              animation:
                "galaus-squeeze var(--squeeze-duration) infinite",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              background: "var(--color2)",
              animation:
                "galaus-squeeze var(--squeeze-duration) infinite",
              animationDelay: "-1.25s",
            }}
          />
        </div>
      </div>

      <p className="font-black text-lg text-slate-500 tracking-wide">
        Loading your Gala…
      </p>

      <style>{`
        @keyframes galaus-squeeze {
          0%    { inset: 0 2em 2em 0; }
          12.5% { inset: 0 2em 0 0; }
          25%   { inset: 2em 2em 0 0; }
          37.5% { inset: 2em 0 0 0; }
          50%   { inset: 2em 0 0 2em; }
          62.5% { inset: 0 0 0 2em; }
          75%   { inset: 0 0 2em 2em; }
          87.5% { inset: 0 0 2em 0; }
          100%  { inset: 0 2em 2em 0; }
        }
        @keyframes galaus-spin {
          to { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};

export default SqueezeLoader;
