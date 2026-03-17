"use client";
import { useRouter } from "next/navigation";
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
  const truncatedText = fullText.slice(0, 180) + "...";

  const profilePic = profile?.profile_pic?.replace(/\"/g, "") || "";
  const profileName = profile?.name?.replace(/\"/g, "") || "";
  const safeDate = profile?.date ? new Date(profile.date) : null;

  const formattedDate =
    safeDate && !Number.isNaN(safeDate.getTime())
      ? safeDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZoneName: "short",
        })
      : "Recently posted";

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
      className={`${width} mx-auto rounded-xl bg-slate-900
        ${disableCardClick ? '' : 'shadow-[0_4px_18px_rgba(0,0,0,0.25)]'}
        ${disableCardClick ? '' : 'hover:shadow-[0_10px_30px_rgba(13,127,242,0.18)]'}
        ${disableCardClick ? '' : 'hover:border-primary/60'}
        ${disableCardClick ? '' : 'transform hover:-translate-y-1'}
        ${disableCardClick ? 'cursor-default' : 'cursor-pointer'}
        transition-all duration-300 border border-slate-800
        h-[230px] sm:h-[250px] flex flex-col relative`}
    >
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <span className="ml-3 text-slate-100">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/95 p-4 text-center text-white shadow-md">
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
        <div className="flex items-start gap-2 border-b border-slate-700 pb-2">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-20 sm:h-20">
              <ProfileAvatar
                src={profilePic}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-primary"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-bold text-slate-100 sm:text-lg">{profileName}</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <GraduationCap size={12} className="text-primary" />
                <span className="truncate">{profile.branch} {profile.batch}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Building2 size={12} className="text-primary" />
                <span className="truncate">{profile.company}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Briefcase size={12} className="text-primary" />
                <span className="truncate">{profile.role}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-primary" />
                <span>{profile.views} Reads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Text Section */}
        <div className="mt-2 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <p
              className="overflow-hidden text-sm leading-6 text-slate-300"
              style={{ display: "-webkit-box", WebkitLineClamp: "4", WebkitBoxOrient: "vertical" }}
            >
              {truncatedText}
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto flex flex-col items-start">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReadMore}
              className="text-primary hover:text-primary/80 font-medium text-xs sm:text-sm transition-colors duration-300"
            >
              Read More
            </button>
            {edit && (
              <button
                onClick={handleEdit}
                className="p-1 rounded-lg text-primary transition-colors duration-300 hover:bg-slate-800"
              >
                <Pencil size={14} />
              </button>
            )}
            {deletePost && (
              <button
                onClick={handleDeleteClick}
                className="p-1 rounded-lg text-red-400 transition-colors duration-300 hover:bg-red-500 hover:text-white"
              >
                <Trash size={14} />
              </button>
            )}
          </div>
          <div className="mt-1 text-[10px] text-slate-500 sm:text-xs">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70">
          <div className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold text-slate-100">Confirm Deletion</h3>
            <p className="mb-6 text-sm text-slate-300">Are you sure you want to delete this experience?</p>
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-500"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white transition hover:bg-slate-600"
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
