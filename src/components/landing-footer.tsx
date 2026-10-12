"use client";

import Link from "next/link";
import { Youtube, Twitter } from "lucide-react";
import { ModeToggle } from "@/components/toggle-theme";

const X_URL = "https://x.com/withmax";
const YT_URL = "https://www.youtube.com/@withmax-b2w";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className=" bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between sm:gap-6">
        <p className="order-2 text-center text-sm text-muted-foreground sm:order-1">
          © {year} Up. All rights reserved.
        </p>
        <div className="order-1 flex items-center gap-6 sm:order-2">
          <ModeToggle />
          <nav className="flex items-center gap-6" aria-label="Social links">
            <Link
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="size-4" aria-hidden />
              <span>Twitter</span>
            </Link>
            <Link
              href={YT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Youtube className="size-4" aria-hidden />
              <span>YouTube</span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
