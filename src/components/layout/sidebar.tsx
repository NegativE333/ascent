"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/lib/actions";
import type { Subject } from "@/lib/types";

function SidebarNav({
  subjects,
  onNavigate,
}: {
  subjects: Subject[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSubject = searchParams.get("subject");
  const [syllabusOpen, setSyllabusOpen] = useState(
    pathname.startsWith("/syllabus")
  );

  const sorted = subjects
    .slice()
    .sort((a, b) => a.display_order - b.display_order);

  const itemClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm transition-colors duration-150",
      active
        ? "bg-sidebar-accent font-medium text-foreground"
        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-1 px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2 rounded-[4px] px-2 py-1.5 text-sm font-semibold text-foreground"
        >
          <span className="flex size-5 items-center justify-center rounded-[3px] bg-foreground text-[10px] font-bold text-background">
            C
          </span>
          SSC CGL
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        <Link
          href="/"
          onClick={onNavigate}
          className={itemClass(pathname === "/")}
        >
          <LayoutDashboard className="size-4 shrink-0 opacity-70" />
          Dashboard
        </Link>

        <div>
          <div
            className={cn(
              itemClass(pathname.startsWith("/syllabus") && !activeSubject)
            )}
          >
            <Link
              href="/syllabus"
              onClick={onNavigate}
              className="flex min-w-0 flex-1 items-center gap-2"
            >
              <BookOpen className="size-4 shrink-0 opacity-70" />
              <span className="truncate">Syllabus</span>
            </Link>
            <button
              type="button"
              aria-label={syllabusOpen ? "Collapse syllabus" : "Expand syllabus"}
              onClick={() => setSyllabusOpen((v) => !v)}
              className="shrink-0 rounded-[3px] p-0.5 text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              {syllabusOpen ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          </div>

          {syllabusOpen && (
            <div className="mt-0.5 grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2 px-2">
              {/* Matches parent icon column so labels line up under "Syllabus" */}
              <div className="relative">
                <div className="absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2 bg-border" />
              </div>
              <div className="min-w-0 space-y-0.5">
                {sorted.map((subject) => {
                  const active =
                    pathname.startsWith("/syllabus") &&
                    activeSubject === subject.slug;
                  return (
                    <Link
                      key={subject.id}
                      href={`/syllabus?subject=${subject.slug}`}
                      onClick={onNavigate}
                    className={cn(
                      "block truncate rounded-[4px] py-1.5 pr-2 text-[13px] transition-colors duration-150",
                      active
                        ? "bg-sidebar-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                    )}
                    >
                      {subject.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href="/analytics"
          onClick={onNavigate}
          className={itemClass(pathname.startsWith("/analytics"))}
        >
          <BarChart3 className="size-4 shrink-0 opacity-70" />
          Analytics
        </Link>

        <Link
          href="/notes"
          onClick={onNavigate}
          className={itemClass(pathname.startsWith("/notes"))}
        >
          <FileText className="size-4 shrink-0 opacity-70" />
          Formula sheet
        </Link>

        <Link
          href="/settings"
          onClick={onNavigate}
          className={itemClass(pathname.startsWith("/settings"))}
        >
          <Settings className="size-4 shrink-0 opacity-70" />
          Settings
        </Link>
      </nav>

      <div className="border-t border-border p-2">
        <form action={signOut}>
          <button type="submit" className={itemClass(false)}>
            <LogOut className="size-4 shrink-0 opacity-70" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ subjects }: { subjects: Subject[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-[240px] shrink-0 border-r border-border bg-sidebar md:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarNav subjects={subjects} />
        </div>
      </aside>

      <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <SidebarNav
              subjects={subjects}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="text-sm font-semibold">SSC CGL</span>
      </div>
    </>
  );
}
