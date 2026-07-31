import { AppShell } from "@/components/layout/app-shell";
import { getSubjects } from "@/lib/data";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const subjects = await getSubjects();
  return <AppShell subjects={subjects}>{children}</AppShell>;
}
