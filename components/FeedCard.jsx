"use client";
import Link from 'next/link';
import { marked } from "marked";
import { Eye, Building2, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";

const FeedCard = ({
  profile,
  width = "w-full",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const fullText = profile.exp_text;
  const truncatedText = fullText.slice(0, 150) + "...";
  const htmlTruncatedText = marked(truncatedText);

  const profilePic = profile.profile_pic.replace(/\"/g, "");
  const profileName = profile.name.replace(/\"/g, "");

  const formattedDate = new Date(profile.date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });


  return (
    <Link
      href={`/single/${profile.uid}`}
      className={`${width} mx-auto bg-white rounded-xl block shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_24px_rgba(24,119,242,0.15)] hover:bg-[#F7FAFF] transform hover:-translate-y-1 cursor-pointer transition-all duration-300 border border-[#E7F3FF] h-[230px] sm:h-[250px] flex flex-col relative`}
      prefetch={true}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-[#1D1D1D]">Loading...</span>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start gap-2 pb-2 border-b border-gray-200">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-20 sm:h-20">
              <img
                src={profilePic || "/api/placeholder/80/80"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-blue-600"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1D] truncate group-hover:text-blue-600">{profileName}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 text-xs sm:text-sm text-[#B0B3B8]"> {/* flex-col on mobile, sm:flex-row on larger */}
              <div className="flex items-center gap-1">
                <GraduationCap size={12} className="text-blue-600" />
                <span className="truncate">{profile.branch} {profile.batch}</span>
              </div>
              <span className="hidden sm:inline">•</span> {/* Separator for larger screens only */}
              <div className="flex items-center gap-1">
                <Building2 size={12} className="text-blue-600" />
                <span className="truncate">{profile.company}</span>
              </div>
              <span className="hidden sm:inline">•</span> {/* Separator for larger screens only */}
              <div className="flex items-center gap-1">
                <Briefcase size={12} className="text-blue-600" />
                <span className="truncate">{profile.role}</span>
              </div>
              <span className="hidden sm:inline">•</span> {/* Separator for larger screens only */}
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-blue-600" />
                <span>{profile.views} Reads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Text Section */}
        <div className="mt-2 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div
              className="prose prose-sm max-w-none overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '4',
                WebkitBoxOrient: 'vertical',
              }}
              dangerouslySetInnerHTML={{ __html: htmlTruncatedText }}
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto flex flex-col items-start">
          <div className="flex items-center gap-2">
             {/* "Read More" Link REMOVED */}
          </div>
          <div className="text-[10px] sm:text-xs text-[#B0B3B8] mt-1">
            {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeedCard;