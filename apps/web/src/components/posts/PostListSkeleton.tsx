import { Skeleton } from "@/components/ui/skeleton";

type PostListSkeletonProps = {
  count?: number;
};

export function PostListSkeleton({ count = 5 }: PostListSkeletonProps) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="border-b px-4 py-3">
          <div className="flex items-start gap-2">
            <Skeleton className="mt-1.5 size-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
