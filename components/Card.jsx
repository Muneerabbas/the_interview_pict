"use client";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Pencil, Trash, Eye, Building2, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";
import ProfileAvatar from './ProfileAvatar';

const ProfileCard = ({
  profile,
  width = "w-full",
  edit = false,
  deletePost = false,
  disableCardClick = false,
  setGlobalLoading,
}) => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fullText = profile?.exp_text || "";
  const truncatedText = fullText.slice(0, 150) + "...";
  const htmlTruncatedText = marked(truncatedText);

  const profilePic = profile?.profile_pic?.replace(/\"/g, "") || "";
  const profileName = profile?.name?.replace(/\"/g, "") || "";

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
    e.stopPropagation();
    console.log("ProfileCard: handleReadMore START");
    setGlobalLoading(true);
    console.log("ProfileCard: setGlobalLoading(true) called from ReadMore");
    router.push(`/single/${profile.uid}`);
    console.log("ProfileCard: router.push called from ReadMore");
    console.log("ProfileCard: handleReadMore END");
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    router.push(`/edit/${profile.uid}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setIsModalOpen(false);
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
        setSuccessMessage("Experience deleted successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
  };

  const handleCardClick = () => {
    if (!disableCardClick) {
      console.log("ProfileCard: handleCardClick START");
      setGlobalLoading(true);
      console.log("ProfileCard: setGlobalLoading(true) called from CardClick");
      router.push(`/single/${profile.uid}`);
      console.log("ProfileCard: router.push called from CardClick");
      console.log("ProfileCard: handleCardClick END");
    }
  };

  const handleProfileHeaderClick = (e) => {
    e.stopPropagation();
    if (!profile?.email) return;
    router.push(`/profile/public/${encodeURIComponent(profile.email)}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`${width} mx-auto bg-white dark:bg-slate-800 rounded-xl
        ${disableCardClick ? '' : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'}
        ${disableCardClick ? '' : 'hover:shadow-[0_8px_24px_rgba(24,119,242,0.15)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'}
        ${disableCardClick ? '' : 'hover:bg-[#F7FAFF] dark:hover:bg-slate-700/50'}
        ${disableCardClick ? '' : 'transform hover:-translate-y-1'}
        ${disableCardClick ? 'cursor-default' : 'cursor-pointer'}
        transition-all duration-300 border border-[#E7F3FF] dark:border-slate-700
        h-[230px] sm:h-[250px] flex flex-col relative group`}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-3 text-[#1D1D1D] dark:text-white">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="absolute inset-0 bg-[#E7F3FF] dark:bg-green-900/40 text-[#1D1D1D] dark:text-white p-4 rounded-xl shadow-md text-center flex items-center justify-center backdrop-blur-sm z-10 transition-colors duration-300">
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00C853] dark:text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.293 5.293a1 1 0 00-1.414 0L8 11.586 4.121 7.707a1 1 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-lg font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      <div className="p-3 flex flex-col h-full">
        {/* Header Section */}
        <div
          onClick={handleProfileHeaderClick}
          className="flex items-start gap-2 pb-2 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300 cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleProfileHeaderClick(e);
            }
          }}
          aria-label={`View ${profileName || "user"} profile`}
        >
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-20 sm:h-20">
              <ProfileAvatar
                src={profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-blue-600 dark:border-blue-500"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#1D1D1D] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{profileName}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 text-xs sm:text-sm text-[#B0B3B8] dark:text-slate-400 transition-colors duration-300">
              <div className="flex items-center gap-1">
                <GraduationCap size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="truncate">{profile.branch} {profile.batch}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Building2 size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="truncate">{profile.company}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Briefcase size={12} className="text-blue-600 dark:text-blue-400" />
                <span className="truncate">{profile.role}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-blue-600 dark:text-blue-400" />
                <span>{profile.views} Reads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Text Section */}
        <div className="mt-2 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div
              className="prose prose-sm dark:prose-invert max-w-none overflow-hidden text-slate-700 dark:text-slate-300 transition-colors duration-300"
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
        <div className="mt-auto flex flex-col items-start pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadMore}
              className="text-blue-600 dark:text-blue-400 hover:text-[#8B77F9] dark:hover:text-indigo-400 font-medium text-xs sm:text-sm transition-colors duration-300"
            >
              Read More
            </button>
            {edit && (
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg hover:bg-[#E7F3FF] dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors duration-300"
                title="Edit Post"
              >
                <Pencil size={14} />
              </button>
            )}
            {deletePost && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded-lg hover:bg-[#FF5F5F] dark:hover:bg-red-500 hover:text-white dark:hover:text-white text-[#FF5F5F] dark:text-red-400 transition-colors duration-300"
                title="Delete Post"
              >
                <Trash size={14} />
              </button>
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-[#B0B3B8] dark:text-slate-500 mt-1.5 transition-colors duration-300">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-700 mx-4">
            <h3 className="text-lg font-bold text-[#1D1D1D] dark:text-white mb-2">Confirm Deletion</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to delete this experience? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-transparent"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
