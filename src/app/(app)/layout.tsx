import { AppShell } from "@/components/layout/app-shell";
import { getSubjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjects = await getSubjects();
  return <AppShell subjects={subjects}>{children}</AppShell>;
}
