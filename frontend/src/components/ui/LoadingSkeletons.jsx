import Skeleton from "./Skeleton";

export function ForecastCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-card animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-14 space-y-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-10 w-12 rounded-full" />
        <div className="flex-1 flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function GaugeSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-card animate-fade-in-up">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-52 w-52 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-white p-4 shadow-card animate-fade-in-up">
      <Skeleton className="mb-4 h-5 w-40" />
      <Skeleton className="h-[360px] w-full rounded-2xl" />
    </div>
  );
}
