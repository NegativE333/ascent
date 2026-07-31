import { SyllabusView } from "@/components/syllabus/syllabus-view";
import { getSubjects, getTopics } from "@/lib/data";

export default async function SyllabusPage() {
  const [subjects, topics] = await Promise.all([getSubjects(), getTopics()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Syllabus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update status, rate confidence, and log MCQ practice.
        </p>
      </div>
      <SyllabusView subjects={subjects} topics={topics} />
    </div>
  );
}
