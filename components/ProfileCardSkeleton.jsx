import React from "react";
import Skeleton from "@/components/ui/Skeleton";

/**
 * Mirrors FeedPostCard's shell exactly (same radius, border, padding, 6x6 avatar).
 * It used to be rounded-3xl with a shadow, a gradient top bar and a 14x14 avatar,
 * so the layout visibly snapped the moment real data arrived.
 */
const ProfileCardSkeleton = () => {
  return (
    <div className="mx-auto w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>

      <Skeleton className="mt-3 h-5 w-3/4" />

      <div className="mt-2 space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>

      <div className="mt-3 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="mt-3 flex gap-1.5">
        <Skeleton className="h-7 w-14 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
