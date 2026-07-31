import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("skeleton rounded-[4px]", className)}
      aria-hidden
      {...props}
    />
  );
}

export function PageHeaderSkeleton({
  titleWidth = "w-36",
  subtitle = true,
}: {
  titleWidth?: string;
  subtitle?: boolean;
}) {
  return (
    <div>
      <Skeleton className={cn("h-8", titleWidth)} />
      {subtitle && <Skeleton className="mt-2 h-4 w-64 max-w-full" />}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <>
      <aside className="hidden h-svh w-[240px] shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex items-center justify-between gap-1 px-3 py-3">
          <div className="flex items-center gap-2 px-2 py-1.5">
            <Skeleton className="size-5 rounded-[3px]" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="size-7 rounded-[4px]" />
        </div>
        <div className="flex-1 space-y-1.5 px-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton
              key={i}
              className="h-8 w-full rounded-[4px]"
              style={{ opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
        <div className="border-t border-border p-3">
          <Skeleton className="h-8 w-full rounded-[4px]" />
        </div>
      </aside>
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
        <Skeleton className="size-8 rounded-[4px]" />
        <Skeleton className="h-4 w-20" />
      </div>
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8" aria-busy aria-label="Loading dashboard">
      <PageHeaderSkeleton titleWidth="w-40" />

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2 px-4 py-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
        <div className="space-y-3 px-4 py-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-2 w-full rounded-[3px]" />
          <Skeleton className="h-2 w-full rounded-[3px]" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="panel space-y-0 overflow-hidden divide-y divide-border">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="size-2 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40 max-w-[70%]" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-[3px]" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-1.5 flex-1 rounded-[2px]" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex w-full gap-[3px]">
          {Array.from({ length: 17 }, (_, wi) => (
            <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, di) => (
                <Skeleton
                  key={di}
                  className="aspect-square w-full rounded-[2px]"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {Array.from({ length: 2 }, (_, col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <div className="panel divide-y divide-border overflow-hidden">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-10" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SyllabusSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6" aria-busy aria-label="Loading syllabus">
      <PageHeaderSkeleton titleWidth="w-28" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="panel overflow-hidden">
        <div className="table-head hidden border-b border-border px-3 py-2 sm:grid sm:grid-cols-[minmax(0,1.3fr)_auto_auto_auto_auto] sm:gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-3 w-14" />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-3 py-3 last:border-0 sm:grid sm:grid-cols-[minmax(0,1.3fr)_auto_auto_auto_auto] sm:gap-3"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-44 max-w-[80%]" />
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="hidden h-5 w-16 rounded-[3px] sm:block" />
            <Skeleton className="hidden h-4 w-16 sm:block" />
            <Skeleton className="h-5 w-14 rounded-[3px]" />
            <Skeleton className="hidden size-7 rounded-md sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8" aria-busy aria-label="Loading analytics">
      <PageHeaderSkeleton titleWidth="w-32" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="panel space-y-2 p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-14" />
          </div>
        ))}
      </div>

      <div className="panel space-y-3 p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="panel space-y-3 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-56 w-full rounded-md" />
        </div>
        <div className="panel space-y-3 p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-56 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function TopicSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8" aria-busy aria-label="Loading topic">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="panel space-y-2 p-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="panel space-y-3 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
      <div className="panel overflow-hidden">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex gap-3 border-b border-border px-3 py-2.5 last:border-0">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6" aria-busy aria-label="Loading settings">
      <PageHeaderSkeleton titleWidth="w-28" />
      <div className="panel max-w-md space-y-5 p-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-6" aria-busy aria-label="Loading notes">
      <PageHeaderSkeleton titleWidth="w-36" />
      <div className="panel space-y-3 p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}
