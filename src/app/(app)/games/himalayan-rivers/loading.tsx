import { PageHeaderSkeleton } from "@/components/ui/page-skeletons";

export default function HimalayanRiversLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="panel h-[480px] skeleton" />
    </div>
  );
}
