import React from 'react';

const ProfileCardSkeleton = () => {
  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-[#E7F3FF] min-h-[280px] flex flex-col animate-pulse">
      <div className="p-4 flex-grow">
        {/* Header Section Skeleton */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200"></div>
          </div>

          {/* Profile Info Skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-6 bg-gray-200 rounded-md mb-2 w-3/4"></div> {/* Name Skeleton */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#B0B3B8]">
              <div className="h-4 bg-gray-200 rounded-md w-1/3"></div> {/* Branch Skeleton */}
              <span>•</span>
              <div className="h-4 bg-gray-200 rounded-md w-1/4"></div> {/* Company Skeleton */}
              <span>•</span>
              <div className="h-4 bg-gray-200 rounded-md w-1/5"></div> {/* Role Skeleton */}
              <span>•</span>
              <div className="h-4 bg-gray-200 rounded-md w-1/6"></div> {/* Views Skeleton */}
            </div>
          </div>
        </div>

        {/* Experience Text Section Skeleton */}
        <div className="mt-4 text-[#1D1D1D]">
          <div className="flex flex-col gap-2">
            <div className="h-4 bg-gray-200 rounded-md mb-2"></div> {/* Line 1 */}
            <div className="h-4 bg-gray-200 rounded-md mb-2"></div> {/* Line 2 */}
            <div className="h-4 bg-gray-200 rounded-md mb-2"></div> {/* Line 3 */}
            <div className="h-4 bg-gray-200 rounded-md mb-2"></div> {/* Line 4 */}
            <div className="h-4 bg-gray-200 rounded-md mb-2 w-5/6"></div> {/* Line 5 */}
            <div className="h-4 bg-gray-200 rounded-md w-1/2"></div> {/* Line 6 */}
          </div>
        </div>
      </div>

      <div className="mt-4 mb-4 ml-4 text-xs text-[#B0B3B8]">
        <div className="h-3 bg-gray-200 rounded-md w-1/4"></div> {/* Date Skeleton */}
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;