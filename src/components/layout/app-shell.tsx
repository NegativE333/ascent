import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { SidebarSkeleton } from "@/components/ui/page-skeletons";
import { getSubjects } from "@/lib/data";

async function SidebarWithData() {
  const subjects = await getSubjects();
  return <Sidebar subjects={subjects} />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <InstallPrompt />
      <div className="flex min-h-full flex-1 flex-col md:flex-row">
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarWithData />
        </Suspense>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
          <div className="mx-auto w-full max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
