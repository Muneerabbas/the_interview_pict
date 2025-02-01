"use client";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Pencil, Trash, Eye, Building2, GraduationCap, Briefcase } from "lucide-react";

const ProfileCard = ({
  profile,
  width = "w-full",
  height = "min-h-[150px]",
  edit = false,
  deletePost = false,
  disableCardClick = false, // New parameter to control card click behavior
}) => {
  const router = useRouter();

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

  const handleReadMore = (e) => {
    e.stopPropagation(); // Prevent the event from bubbling up to the card click handler
    router.push(`/single/${profile.uid}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    router.push(`/edit/${profile.uid}`);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmation = window.confirm("Are you sure you want to delete this experience?");
    if (!confirmation) return;

    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: profile.uid,
          email: profile.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Experience deleted successfully");
        onDelete?.(profile.uid);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const handleCardClick = () => {
    if (!disableCardClick) {
      router.push(`/single/${profile.uid}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`${width} mx-auto bg-white rounded-xl 
        ${disableCardClick ? '' : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]'} 
        ${disableCardClick ? '' : 'hover:shadow-[0_8px_24px_rgba(24,119,242,0.15)]'}
        ${disableCardClick ? '' : 'hover:bg-[#F7FAFF]'} 
        ${disableCardClick ? '' : 'transform hover:-translate-y-1'} 
        ${disableCardClick ? 'cursor-default' : 'cursor-pointer'}
        transition-all duration-300 border border-[#E7F3FF] ${height} flex flex-col relative`}
    >
      <div className="p-4 flex-grow">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20">
              <img
                src={profilePic || "/api/placeholder/80/80"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-[#1877F2]"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#1D1D1D] truncate group-hover:text-[#1877F2]">{profileName}</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#B0B3B8]">
              <div className="flex items-center gap-1">
                <GraduationCap size={14} className="text-[#1877F2]" />
                <span className="truncate">{profile.branch}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Building2 size={14} className="text-[#1877F2]" />
                <span className="truncate">{profile.company}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Briefcase size={14} className="text-[#1877F2]" />
                <span className="truncate">{profile.role}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Eye size={14} className="text-[#1877F2]" />
                <span>{profile.views} views</span>
              </div>
            </div>
          </div>
        </div>
        

        {/* Experience Text Section */}
        <div className="mt-4 text-[#1D1D1D]">
          <div className="flex flex-col gap-2">
            <div 
              className="prose prose-sm max-w-none line-clamp-6"
              dangerouslySetInnerHTML={{ __html: htmlTruncatedText }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleReadMore}
                className="text-[#1877F2] hover:text-[#8B77F9] font-medium text-sm transition-colors duration-300"
              >
                Read More
              </button>
              {edit && (
                <button 
                  onClick={handleEdit}
                  className="p-1 rounded-lg hover:bg-[#E7F3FF] text-[#1877F2] transition-colors duration-300"
                >
                  <Pencil size={16} />
                </button>
              )}
              {deletePost && (
                <button 
                  onClick={handleDelete}
                  className="p-1 rounded-lg hover:bg-[#FF5F5F] hover:text-white text-[#FF5F5F] transition-colors duration-300"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date at the bottom */}
      <div className="mt-4 mb-4 ml-4 text-xs text-[#B0B3B8]">
        {formattedDate}
      </div>
    </div>
  );
};

export default ProfileCard;
