
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Layers,
  Bot,
  Calendar,
  Settings,
  UserPlus,
  ChevronsRight,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAskAIStore } from "@/features/brain/hooks/use-ask-ai-store";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar-store";

const navItems = [
  { title: "Spaces", url: "/dashboard", icon: Layers },
  { title: "Chat", url: "/dashboard/chat", icon: Calendar },
  { title: "Agents", url: "/dashboard/agents", icon: Bot },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

interface Props {
  children: React.ReactNode;
}

export default function DashboardSidebarClient({ children }: Props) {
  const pathname = usePathname();
  const { sidebarOpen, openSidebar } = useSidebar();
  const { open } = useAskAIStore();

  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return (
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/lists")
      );
    }

    return pathname.startsWith(url);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden px-2 pb-2">
      <header className="flex h-12 shrink-0 items-center justify-between bg-background">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <Image
            src="/logo.svg"
            alt="Up"
            width={26}
            height={26}
            className="shrink-0"
          />
          <span className="font-semibold">Up</span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>
            AI powered by{" "}
            <strong className="font-medium text-foreground">Groq</strong> free
            tier · 30 requests/min limit
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 gap-2"
            onClick={open}
          >
            <Sparkles className="size-4" />
            Ask AI
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="size-8 rounded-full"
            aria-label="User profile"
          >
            <UserRound className="size-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden gap-2">
        <aside className="flex w-16 shrink-0 flex-col rounded-lg bg-primary">
          {!sidebarOpen && (
            <div className="flex justify-center border-b border-primary-foreground/15 py-2">
              <button
                onClick={openSidebar}
                className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                aria-label="Open sidebar"
              >
                <span className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-primary-foreground/10">
                  <ChevronsRight className="size-4" />
                </span>
              </button>
            </div>
          )}

          <nav className="flex flex-1 flex-col items-center gap-2 py-1">
            {navItems.map((item) => {
              const active = isActive(item.url);

              return (
                <Link
                  key={item.title}
                  prefetch={true}
                  href={item.url}
                  className="group flex flex-col items-center gap-1 px-2 py-1 text-sm font-medium text-primary-foreground"
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary-foreground text-primary"
                        : "group-hover:bg-primary-foreground/10",
                    )}
                  >
                    <item.icon className="size-4" />
                  </span>

                  <span className="text-xs font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col items-center gap-2 border-t border-primary-foreground/20 pb-2">
            <button
              type="button"
              className="group flex flex-col items-center gap-1 px-2 py-1 text-xs font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
              aria-label="Invite member"
            >
              <span className="flex size-9 items-center justify-center rounded-lg transition-colors group-hover:bg-primary-foreground/10">
                <UserPlus className="size-4" />
              </span>
              <span className="text-xs font-medium">Invite</span>
            </button>
          </div>
        </aside>

        <main className="flex flex-1 overflow-hidden border rounded-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
