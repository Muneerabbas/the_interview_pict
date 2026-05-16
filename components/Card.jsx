"use client";
import { useRouter } from "next/navigation";
import { Pencil, Trash, Eye, Building2, GraduationCap, Briefcase } from "lucide-react";
import { useState } from "react";
import ProfileAvatar from './ProfileAvatar';
import Image from "next/image";
import { readJson } from "@/lib/client-api";
import { toPlainText } from "@/lib/text-preview";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { resolveProfileImage, resolveProfileName } from "@/lib/utils";

const ProfileCard = ({
  profile,
  width = "w-full",
  edit = false,
  deletePost = false,
  disableCardClick = false,
  setGlobalLoading,
  onDeleted,
}) => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Previously this ran marked() over a byte-sliced fragment and injected the
  // result with dangerouslySetInnerHTML -- unsanitized stored XSS, plus torn
  // markup whenever the 150th character landed mid-tag.
  const preview = toPlainText(profile?.exp_text || "", 180);

  const profilePic = resolveProfileImage(profile) || "";
  const profileName = resolveProfileName(profile);
  const articleId = profile?.uid || profile?._id?.toString?.() || profile?._id || "";
  const isProfileContext = edit && deletePost;

  const dateObj = profile?.date ? new Date(profile.date) : null;
  const isValidDate = dateObj && !Number.isNaN(dateObj.getTime());
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Date unavailable";

  const handleReadMore = (e) => {
    e.stopPropagation();
    if (!articleId) return;
    setGlobalLoading?.(true);
    router.push(`/single/${articleId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    // articleId, not profile.uid: a document without a uid navigated to
    // /edit/undefined and left the overlay up forever.
    if (!articleId) return;
    setIsLoading(true);
    router.push(`/edit/${articleId}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return; // the confirm button used to allow a second DELETE
    setIsDeleting(true);
    setDeleteError("");
    try {
      const response = await fetch('/api/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // The author is derived from the session server-side; sending an email
        // here was the IDOR.
        body: JSON.stringify({ uid: profile.uid }),
      });

      const data = await readJson(response, {});
      if (response.ok) {
        setIsModalOpen(false);
        setSuccessMessage("Experience deleted successfully!");
        // router.refresh() did nothing here: the profile list lives in client
        // state, so the deleted card stayed on screen under a success banner that
        // never cleared. The owner drops it from its own list instead.
        onDeleted?.(profile);
      } else {
        setDeleteError(data?.error || data?.message || "Could not delete this post.");
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      setDeleteError("Network error. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsModalOpen(false);
    setDeleteError("");
  };

  const handleCardClick = () => {
    if (!disableCardClick && articleId) {
      setGlobalLoading?.(true);
      router.push(`/single/${articleId}`);
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
      className={`${width} mx-auto bg-white dark:bg-slate-900 rounded-xl
        ${disableCardClick ? '' : 'shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'}
        ${disableCardClick ? '' : 'hover:shadow-[0_8px_24px_rgba(24,119,242,0.15)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]'}
        ${disableCardClick ? '' : 'hover:bg-[#F7FAFF] dark:hover:bg-slate-700/50'}
        ${disableCardClick ? '' : 'transform hover:-translate-y-1'}
        ${disableCardClick ? 'cursor-default' : 'cursor-pointer'}
        transition-all duration-300 border border-slate-200 dark:border-slate-800
        min-h-[230px] sm:min-h-[250px] flex flex-col relative group`}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/60 flex justify-center items-center z-[1200]">
          <div className="relative rounded-xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.2)] dark:border-slate-700/80 dark:bg-slate-900/95">
            <span className="pointer-events-none absolute inset-0 rounded-xl bg-blue-500/10 blur-xl animate-pulse dark:bg-blue-400/10" />
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-500/25 border-t-blue-600 animate-spin dark:border-blue-400/25 dark:border-t-blue-300" />
            <div className="relative h-11 w-11">
              <Image src="/app_icon.png" alt="theInterview loading" fill className="object-contain" />
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
            <div className={`${isProfileContext ? "w-10 h-10 sm:w-11 sm:h-11 opacity-85" : "w-12 h-12 sm:w-20 sm:h-20"}`}>
              <ProfileAvatar
                src={profilePic}
                name={profileName}
                alt={profileName ? `${profileName}'s avatar` : ""}
                className={`w-full h-full rounded-full object-cover ${isProfileContext ? "border border-blue-400/55 dark:border-blue-400/50" : "border-2 border-blue-600 dark:border-blue-500"}`}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className={`${isProfileContext ? "text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300" : "text-base sm:text-lg font-bold text-[#1D1D1D] dark:text-white"} truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300`}>{profileName}</h2>
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 ${isProfileContext ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"} text-[#B0B3B8] dark:text-slate-400 transition-colors duration-300`}>
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
            <p
              className="max-w-none overflow-hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 transition-colors duration-300"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: '4',
                WebkitBoxOrient: 'vertical',
              }}
            >
              {preview}
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-700/80 pt-2">
            <button
              onClick={handleReadMore}
              className="text-blue-600 dark:text-blue-400 hover:text-[#8B77F9] dark:hover:text-indigo-400 font-medium text-xs sm:text-sm transition-colors duration-300"
            >
              Read More
            </button>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-1.5 py-1 dark:border-slate-700 dark:bg-slate-700/40">
              {edit && (
                <button
                  onClick={handleEdit}
                  className="rounded-md p-2 text-blue-600 transition-colors duration-300 hover:bg-blue-100 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/35 dark:hover:text-blue-300"
                  title="Edit Post"
                  aria-label="Edit post"
                >
                  <Pencil size={16} />
                </button>
              )}
              {deletePost && (
                <button
                  onClick={handleDeleteClick}
                  className="rounded-md p-2 text-[#FF5F5F] transition-colors duration-300 hover:bg-[#FF5F5F] hover:text-white dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                  title="Delete Post"
                  aria-label="Delete post"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="mt-1.5 text-[10px] sm:text-xs text-[#B0B3B8] dark:text-slate-500 transition-colors duration-300">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal
        open={isModalOpen}
        onClose={handleCancelDelete}
        title="Confirm Deletion"
        size="sm"
        closeOnOutsideClick={!isDeleting}
      >
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this experience? This action cannot be undone.
        </p>
        <Alert tone="error" className="mb-4">{deleteError}</Alert>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default ProfileCard;
