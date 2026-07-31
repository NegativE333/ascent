import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import type { Subject } from "@/lib/types";

export function AppShell({
  children,
  subjects,
}: {
  children: React.ReactNode;
  subjects: Subject[];
}) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <Suspense fallback={<aside className="hidden w-[240px] border-r border-border bg-sidebar md:block" />}>
        <Sidebar subjects={subjects} />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
        <div className="mx-auto w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
