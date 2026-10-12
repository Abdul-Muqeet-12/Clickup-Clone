import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { LandingFooter } from "@/components/landing-footer";
import { HeroVisual } from "@/components/hero-visual";
import { Sora } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
});

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-muted px-4 py-2 text-center text-sm text-muted-foreground">
        <Link
          href="https://withmax.pro?utm_source=up&utm_medium=banner&utm_campaign=landing"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium transition-colors hover:text-foreground"
        >
          Get the code & build your own → withmax.pro
        </Link>
      </div>

      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <Image src="/logo.svg" alt="Up" width={26} height={26} className="shrink-0" />
            <span>Up</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard" className="font-medium">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard" className="font-medium">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col justify-center px-6 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto max-w-lg">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Project management, simplified
            </p>
            <h1 className={`${sora.className} text-4xl font-bold tracking-tight text-foreground sm:text-5xl`}>
              Up — The ClickUp Clone
            </h1>
            <h2 className="mt-2 text-xl font-medium text-muted-foreground sm:text-2xl">
              Ship faster, together
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tasks, chat, docs, and AI agents in one place. Replace scattered
              tools with a single workspace.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">Get started — it&apos;s free</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Free forever · No credit card
              </p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[40vh] min-w-0 flex-1 overflow-hidden lg:min-h-[60vh]">
          <HeroVisual />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
