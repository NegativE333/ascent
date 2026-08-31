import { SyllabusView } from "@/components/syllabus/syllabus-view";
import { getSectionalMocks, getSubjects, getTopics } from "@/lib/data";

export default async function SyllabusPage() {
  const [subjects, topics, sectionalMocks] = await Promise.all([
    getSubjects(),
    getTopics(),
    getSectionalMocks(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Syllabus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update status, rate confidence, log MCQ practice, and track sectional
          mocks per subject.
        </p>
      </div>
      <SyllabusView
        subjects={subjects}
        topics={topics}
        sectionalMocks={sectionalMocks}
      />
    </div>
  );
}
