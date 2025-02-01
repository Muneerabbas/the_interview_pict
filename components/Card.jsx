"use client";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import { Pencil, Trash } from "lucide-react"; // Icons

const ProfileCard = ({
  profile,
  width = "mx-4",
  height = "h-60",
  edit = false,
  deletePost = false,
  onEdit,
  onDelete,
}) => {
  const router = useRouter();

  // Markdown conversion for description text
  const fullText = profile.exp_text;
  const truncatedText = fullText.slice(0, 100) + "...";
  const htmlTruncatedText = marked(truncatedText);

  // Clean up profile picture URL and name
  const profilePic = profile.profile_pic.replace(/\"/g, "");
  const profileName = profile.name.replace(/\"/g, "");

  // Format date for display
  const formattedDate = new Date(profile.date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle "Read More" button click to navigate to profile detail
  const handleReadMore = () => {
    router.push(`/single/${profile.uid}`); 
  };

  return (
    <div className={`${width} my-6 bg-white rounded-xl shadow-md border border-gray-200 ${height}`}>
      <div className="p-6 h-full flex flex-col relative">
        {/* Profile Header */}
        <div className="flex items-start gap-6 mb-2">
          <div className="flex-shrink-0 relative w-20 pb-20">
            <img
              src={profilePic || "/api/placeholder/80/80"}
              alt="Profile"
              className="absolute inset-0 w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{profileName}</h2>
            <p className="text-sm text-gray-600 truncate">
              {profile.branch} | {profile.company} | {profile.role} | {profile.batch}
            </p>
            <p className="text-sm text-gray-500">Views: {profile.views}</p>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {/* Experience Text */}
        <div className="text-gray-800 flex-1 relative">
          <div
            className="text-base leading-relaxed max-h-28 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: htmlTruncatedText }}
          />
          {/* Read More Button */}
          <div className="text-right mt-2">
            <button
              onClick={handleReadMore}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Read More
            </button>
          </div>
        </div>

        {/* Edit/Delete Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          {edit && (
            <button onClick={() => onEdit(profile._id)} className="text-blue-500 hover:text-blue-700">
              <Pencil size={20} />
            </button>
          )}
          {deletePost && (
            <button onClick={() => onDelete(profile._id)} className="text-red-500 hover:text-red-700">
              <Trash size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
