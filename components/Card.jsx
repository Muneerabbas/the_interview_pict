

"use client"; // Required for useRouter
import { useRouter } from "next/navigation"; // Import useRouter

const ProfileCard = ({ profile }) => {
  const router = useRouter(); // Initialize the router

  const fullText = profile.exp_text;
  const truncatedText = fullText.slice(0, 100) + "...";

  // Fixing the profile_pic and name fields by removing unnecessary quotes
  const profilePic = profile.profile_pic.replace(/\"/g, "");
  const profileName = profile.name.replace(/\"/g, "");

  const formattedDate = new Date(profile.date).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handle redirection to the new page
  const handleReadMore = () => {
    router.push(`/single/${profile.uid}`); // Redirect to the page with the unique ID
  };

  return (
    <div className="mx-4 my-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="p-6">
        <div className="flex items-start gap-6 mb-4">
          <div className="flex-shrink-0 relative w-20 pb-20">
            <img
              src={profilePic || "/api/placeholder/80/80"}
              alt="Profile"
              className="absolute inset-0 w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {profileName}
              </h2>
              <p className="text-sm text-gray-600 truncate">
                {profile.branch} | {profile.company} | {profile.role} |{" "}
                {profile.batch}
              </p>
              <p className="text-sm text-gray-500">Views: {profile.views}</p>
            </div>
          </div>
        </div>

        <div className="text-gray-800 mb-4">
          <p className="text-base leading-relaxed">
            {truncatedText}
            <button
              onClick={handleReadMore} // Trigger redirection
              className="text-blue-600 hover:text-blue-700 font-medium ml-2 inline-block"
            >
              read more
            </button>
          </p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <p>{profile.date}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
