"use client";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Pencil, Trash, Eye, Building2, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";

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
    e.stopPropagation();
    console.log("ProfileCard: handleReadMore START");
    setGlobalLoading(true);
    console.log("ProfileCard: setGlobalLoading(true) called from ReadMore");
    router.push(`/single/${profile.uid}`); // prefetch={true} scroll={false} - Not applicable here, for <Link> components
    console.log("ProfileCard: router.push called from ReadMore");
    console.log("ProfileCard: handleReadMore END");
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    router.push(`/edit/${profile.uid}`); // prefetch={true} scroll={false} - Not applicable here, for <Link> components
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
      router.push(`/single/${profile.uid}`); // prefetch={true} scroll={false} - Not applicable here, for <Link> components
      console.log("ProfileCard: router.push called from CardClick");
      console.log("ProfileCard: handleCardClick END");
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
        transition-all duration-300 border border-[#E7F3FF]
        h-[230px] sm:h-[250px] flex flex-col relative`}
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

      {successMessage && (
        <div className="absolute inset-0 bg-[#E7F3FF] text-[#1D1D1D] p-4 rounded-xl shadow-md text-center flex items-center justify-center">
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 text-[#00C853] mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M16.293 5.293a1 1 0 00-1.414 0L8 11.586 4.121 7.707a1 1 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
            <span className="text-lg">{successMessage}</span>
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
            <button
              onClick={handleReadMore}
              className="text-blue-600 hover:text-[#8B77F9] font-medium text-xs sm:text-sm transition-colors duration-300"
            >
              Read More
            </button>
            {edit && (
              <button
                onClick={handleEdit}
                className="p-1 rounded-lg hover:bg-[#E7F3FF] text-blue-600 transition-colors duration-300"
              >
                <Pencil size={14} />
              </button>
            )}
            {deletePost && (
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-lg hover:bg-[#FF5F5F] hover:text-white text-[#FF5F5F] transition-colors duration-300"
              >
                <Trash size={14} />
              </button>
            )}
          </div>
          <div className="text-[10px] sm:text-xs text-[#B0B3B8] mt-1">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#1D1D1D] mb-4">Confirm Deletion</h3>
            <p className="text-sm text-[#1D1D1D] mb-6">Are you sure you want to delete this experience?</p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-white font-semibold bg-gray-500 hover:bg-green-600 rounded-lg transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-white font-semibold bg-red-500 hover:bg-green-600 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;