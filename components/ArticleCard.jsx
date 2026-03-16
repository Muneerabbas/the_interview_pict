import React from 'react';
import Link from 'next/link'; // Import Link
import ProfileAvatar from './ProfileAvatar';

// Import your icons from a library or define them if they are custom
import { Building2, Briefcase, GraduationCap, CalendarDays, Eye } from 'lucide-react'; // Make sure these are correct imports

const ArticleCard = ({ article }) => {
  const { profile_pic, name, company, role, batch, date, views, uid ,branch} = article || {};

  // Format the date
  const formattedDate = date ? new Date(date).toLocaleDateString() : "";

  return (
    <Link // Replace <a> with Link
      href={`/single/${uid}`}
      prefetch={true} // Add prefetch={true}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-[#F0F2F5] overflow-hidden"
      aria-label={`Read the experience of ${name}`} // Adding accessibility
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#F0F2F5]">
            <ProfileAvatar
              src={profile_pic}
              alt={`${name || "Candidate"} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1D1D1D] text-lg truncate">{name}</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="flex items-center gap-1.5 text-blue-600">
                <Building2 size={14} />
                <span className="text-[#1D1D1D] truncate">{company}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600">
                <Briefcase size={14} />
                <span className="text-[#1D1D1D] truncate">{role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600">
                <GraduationCap size={14} />
                <span className="text-[#1D1D1D]">{branch} {batch}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-600">
                <CalendarDays size={14} />
                <span className="text-[#1D1D1D] text-sm">{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 bg-[#E7F3FF] border-t border-[#F0F2F5] flex items-center justify-between">
        <span className="text-blue-600 text-sm font-medium">Read Experience</span>
        <div className="flex items-center gap-1 text-[#B0B3B8]">
          <Eye size={14} />
          <span className="text-sm">{views}</span>
        </div>
      </div>
    </Link> // Closing Link tag
  );
};

export default ArticleCard;
