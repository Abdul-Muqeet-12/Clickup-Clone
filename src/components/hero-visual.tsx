"use client";

import Image from "next/image";
import { Syne } from "next/font/google";

const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

const ANNOTATIONS = [
  { label: "Works 24/7", x: 18, y: 24, anchorX: 46, anchorY: 38, delay: 500 },
  { label: "Delegate any task", x: 20, y: 69, anchorX: 46, anchorY: 62, delay: 650 },
  { label: "Smart focus", x: 80, y: 20, anchorX: 57, anchorY: 34, delay: 800 },
  { label: "Infinite memory", x: 80, y: 66, anchorX: 57, anchorY: 58, delay: 950 },
] as const;

export function HeroVisual() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-background"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.12] dark:opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "220px 220px",
          mixBlendMode: "multiply",
        }}
      />

      {/* Soft center halo */}
      <div
        className="absolute left-1/2 top-[52%] z-10 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl dark:opacity-70"
        style={{
          background:
            "radial-gradient(circle, oklch(0.86 0.08 30 / 0.2) 0%, oklch(0.83 0.06 24 / 0.08) 35%, transparent 75%)",
        }}
      />

      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <defs>
          <linearGradient id="heroLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.06" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.24" />
          </linearGradient>
        </defs>
        {ANNOTATIONS.map((a, i) => (
          <g key={a.label}>
            <line
              x1={a.x}
              y1={a.y}
              x2={a.anchorX}
              y2={a.anchorY}
              stroke="url(#heroLineGrad)"
              strokeWidth="0.3"
              strokeLinecap="round"
              className="text-foreground dark:text-white"
              strokeDasharray="120"
              strokeDashoffset="120"
              style={{
                animation: "heroDrawLine 1s cubic-bezier(0.22,1,0.36,1) forwards",
                animationDelay: `${a.delay}ms`,
              }}
            />
            <circle
              cx={a.anchorX}
              cy={a.anchorY}
              r="0.55"
              fill="currentColor"
              className="text-foreground/35 opacity-0 dark:text-white/45 animate-[heroFadeIn_0.5s_ease_forwards]"
              style={{ animationDelay: `${a.delay + 220}ms` }}
            />
          </g>
        ))}
      </svg>

      {/* Portrait card */}
      <div className="relative z-30 flex h-full w-full items-center justify-center px-8 lg:justify-end lg:pr-16">
        <div
          className="relative w-[min(74vw,340px)] opacity-0 animate-[heroReveal_0.9s_cubic-bezier(0.22,1,0.36,1)_forwards] sm:w-[min(56vw,350px)] lg:w-[min(28vw,360px)]"
          style={{ animationDelay: "140ms" }}
        >
          <div
            className="relative aspect-4/5 overflow-hidden rounded-[2rem] border border-white/50 bg-white/30 backdrop-blur-sm dark:border-white/15 dark:bg-black/20"
          >
            <Image
              src="/avatar1.jpg"
              alt=""
              fill
              priority
              className="scale-[1.03] object-cover object-[center_12%]"
              sizes="(max-width: 1024px) 62vw, 28vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(160deg, oklch(0.83 0.13 30 / 0.22) 0%, transparent 42%, oklch(0.58 0.17 280 / 0.12) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, oklch(0.56 0.17 26 / 0.24) 0%, transparent 35%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[2rem]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.36)" }}
            />
          </div>

        </div>
      </div>

      {ANNOTATIONS.map((a, i) => (
        <div
          key={`${a.label}-label`}
          className="absolute z-40 hidden opacity-0 animate-[heroFadeIn_0.55s_ease_forwards] sm:block"
          style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
            animationDelay: `${a.delay + 300}ms`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="rounded-full border border-black/8 bg-white/45 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground/55 backdrop-blur-sm dark:border-white/15 dark:bg-black/30 dark:text-white/55">
            {a.label}
          </span>
        </div>
      ))}

      {/* Watermark */}
      <div
        className={`absolute left-1/2 top-[47%] z-10 -translate-x-1/2 -translate-y-1/2 select-none opacity-0 animate-[heroFadeIn_1.2s_ease_forwards] ${syne.className}`}
        style={{ animationDelay: "350ms" }}
      >
        <span className="whitespace-nowrap text-[clamp(2.4rem,6.4vw,5rem)] font-extrabold uppercase leading-none tracking-[-0.02em] text-foreground/6 dark:text-white/6">
          Super Agent
        </span>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            "linear-gradient(to right, var(--background) 0%, transparent 14%, transparent 86%, var(--background) 100%), linear-gradient(to bottom, var(--background) 0%, transparent 18%, transparent 88%, var(--background) 100%)",
        }}
      />
    </div>
  );
}
