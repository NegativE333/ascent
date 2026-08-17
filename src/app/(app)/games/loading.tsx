import { PageHeaderSkeleton } from "@/components/ui/page-skeletons";

export default function GamesLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="panel h-[88px] skeleton" />
        <div className="panel h-[88px] skeleton opacity-60" />
      </div>
    </div>
  );
}
