"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For navigation
import Link from "next/link";
import { Home, FileText, LogOut, Search } from "lucide-react"; // Icons
import { useSession, signOut } from "next-auth/react"; // NextAuth

export default function Navbar() {
  const { data: session } = useSession(); // Get session data
  const [searchText, setSearchText] = useState(""); // For search text input
  const router = useRouter(); // Router for navigation

  // Clear specific cookies
  const clearCookies = () => {
    document.cookie = "auth_token=; max-age=0; path=/";
    document.cookie = "session_id=; max-age=0; path=/";
  };

  // Handle logout
  const handleLogout = () => {
    clearCookies(); // Clear cookies
    signOut({ callbackUrl: "/" }); // Redirect to the home page after logout
    // console.log("Logout successful");
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // If the search text is empty, set it to the default query "Himanshu Nilay"
    const query = searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText.trim();
    router.push(`/search/${encodeURIComponent(query)}`); // Update the URL with the search query
  };
  
  

  return (
    <nav className="w-full bg-white p-4 shadow-sm flex justify-between items-center">
      {/* Left Links */}
      <ul className="flex space-x-6 items-center">
        {/* Home */}
        <li className="flex flex-col items-center">
          <Link href="/home" className="text-black flex flex-col items-center">
            <Home size={24} />
            <span className="text-sm">Home</span>
          </Link>
        </li>

        {/* Post */}
        <li className="flex flex-col items-center">
          <Link href="/post" className="text-black flex flex-col items-center">
            <FileText size={24} />
            <span className="text-sm">Post</span>
          </Link>
        </li>
      </ul>

      {/* Center Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Search size={20} />
        </button>
      </form>

      {/* Right Links */}
      <ul className="flex space-x-6 items-center">
        {/* Logout */}
        {session && (
          <li className="flex flex-col items-center">
            <button
              onClick={handleLogout}
              className="text-black flex flex-col items-center hover:text-yellow-500 transition duration-300"
            >
              <LogOut size={24} />
              <span className="text-sm">Logout</span>
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}


// import Link from 'next/link';
// import { Home, FileText, LogOut } from 'lucide-react'; // Icons
// import { useSession, signOut } from 'next-auth/react'; // NextAuth

// export default function Navbar() {
//   const { data: session } = useSession(); // Get session data

//   // Clear specific cookies
//   const clearCookies = () => {
//     document.cookie = "auth_token=; max-age=0; path=/";
//     document.cookie = "session_id=; max-age=0; path=/";
//   };

//   // Handle logout
//   const handleLogout = () => {
//     clearCookies(); // Clear cookies
//     signOut({ callbackUrl: "/" }); // Redirect to the home page after logout
//     console.log("Logout successful");
//   };

//   return (
//     <nav className="w-full bg-white p-4 shadow-sm">
//       <ul className="flex justify-end space-x-6 items-center">
//         {/* Home */}
//         <li className="flex flex-col items-center">
//           <Link href="/" className="text-black flex flex-col items-center">
//             <Home size={24} />
//             <span className="text-sm">Home</span>
//           </Link>
//         </li>

//         {/* Post */}
//         <li className="flex flex-col items-center">
//           <Link href="/post" className="text-black flex flex-col items-center">
//             <FileText size={24} />
//             <span className="text-sm">Post</span>
//           </Link>
//         </li>

//         {/* Logout */}
//         {session && (
//           <li className="flex flex-col items-center">
//             <button
//               onClick={handleLogout}
//               className="text-black flex flex-col items-center hover:text-yellow-500 transition duration-300"
//             >
//               <LogOut size={24} />
//               <span className="text-sm">Logout</span>
//             </button>
//           </li>
//         )}
//       </ul>
//     </nav>
//   );
// }

