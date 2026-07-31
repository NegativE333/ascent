import { NotesSheet } from "@/components/notes/notes-sheet";
import { getNotesTopics } from "@/lib/data";

export default async function NotesPage() {
  const topics = await getNotesTopics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Formula sheet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All topic notes in one place for quick revision.
        </p>
      </div>
      <NotesSheet topics={topics} />
    </div>
  );
}
