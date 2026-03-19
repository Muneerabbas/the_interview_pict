import React from "react";

const ProfileCardSkeleton = () => {
  return (
    <div className="w-full mx-auto animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_5px_20px_rgba(15,23,42,0.06)]">
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-indigo-500/30"></div>

      <div className="p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-200"></div>
            <div className="min-w-0">
              <div className="h-5 w-40 rounded-md bg-slate-200"></div>
              <div className="mt-2 h-3 w-28 rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="h-7 w-20 rounded-full bg-slate-200"></div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2.5">
          <div className="h-8 w-40 rounded-lg bg-slate-200"></div>
          <div className="h-8 w-32 rounded-lg bg-slate-200"></div>
          <div className="h-8 w-36 rounded-lg bg-slate-200"></div>
        </div>

        <div className="space-y-3">
          <div className="h-4 w-full rounded-md bg-slate-200"></div>
          <div className="h-4 w-full rounded-md bg-slate-200"></div>
          <div className="h-4 w-5/6 rounded-md bg-slate-200"></div>
          <div className="h-4 w-2/3 rounded-md bg-slate-200"></div>
        </div>

        <div className="mt-6 h-4 w-36 rounded-md bg-slate-200"></div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
