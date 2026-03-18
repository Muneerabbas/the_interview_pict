"use client";
import Link from 'next/link';
import { marked } from "marked";
import { Building2, GraduationCap, Briefcase, MoreHorizontal, ArrowRight, Clock } from "lucide-react";
import { useState } from "react";
import ProfileAvatar from './ProfileAvatar';

const FeedCard = ({
  profile,
  width = "w-full",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const fullText = profile?.exp_text || "";
  const truncatedText = fullText.slice(0, 150) + "...";
  const htmlTruncatedText = marked(truncatedText);

  const profilePic = profile?.profile_pic?.replace(/\"/g, "") || "";
  const profileName = profile?.name?.replace(/\"/g, "") || "";

  const formattedDate = new Date(profile?.date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).toUpperCase();

  return (
    <Link
      href={`/single/${profile.uid}`}
      className={`${width} mx-auto bg-white rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 border border-slate-100 flex flex-col relative`}
      prefetch={true}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex justify-center items-center z-10 rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="p-6 flex flex-col h-full w-full">
        {/* Header Section */}
        <div className="flex items-start justify-between pb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profilePic && profilePic !== "" ? (
                <ProfileAvatar
                  src={profilePic}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-lg">
                  {profileName.charAt(0).toUpperCase() || "S"}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold text-[#1D1D1D] uppercase truncate leading-tight">
                {profileName}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <GraduationCap size={13} className="text-slate-400" />
                  <span>{profile.branch} {profile.batch}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building2 size={13} className="text-slate-400" />
                  <span>{profile.company}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  <span>{profile.role}</span>
                </div>
                <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {profile.views} Reads
                </div>
              </div>
            </div>
          </div>
          
          <button className="text-slate-400 hover:text-slate-600 p-1 flex-shrink-0" onClick={(e) => e.preventDefault()}>
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Experience Text Section */}
        <div className="mt-2 flex-1 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-[#1D1D1D] mb-3 flex items-center gap-2 truncate">
             🌟 Interview Experience – <span className="text-blue-600">{profile.company}</span>
          </h3>
          <div className="pl-4 border-l-2 border-slate-100 mb-4 flex-1">
            <div
              className="prose prose-sm text-slate-600 max-w-none text-[14px] leading-relaxed"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
              dangerouslySetInnerHTML={{ __html: htmlTruncatedText }}
            />
          </div>
          
          <div className="font-bold text-blue-600 text-[13px] flex items-center gap-1.5 mb-2 hover:text-blue-700 w-max">
            Read More <ArrowRight size={14} />
          </div>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100/60 mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-semibold tracking-wider">
            <Clock size={13} />
            {formattedDate}
          </div>
          <div className="flex items-center gap-4 text-[13px] font-bold text-slate-400">
            <button className="hover:text-slate-600 transition" onClick={(e) => e.preventDefault()}>Helpful</button>
            <button className="hover:text-slate-600 transition" onClick={(e) => e.preventDefault()}>Comment</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeedCard;