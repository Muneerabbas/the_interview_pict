// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Home, FileText, LogOut, Search, User, LogIn, Menu, X } from "lucide-react";
// import { useSession, signOut, signIn } from "next-auth/react";

// export default function Navbar() {
//   const { data: session } = useSession();
//   const [searchText, setSearchText] = useState("");
//   const [visible, setVisible] = useState(true);
//   const [lastScrollY, setLastScrollY] = useState(0);
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isTransitioning, setIsTransitioning] = useState(false);

//   const placeholders = [
//     "Search anything",
//     "Search technology",
//     "Search branch",
//     "Search batch",
//     "Search company",
//     "Search name",
//   ];

//   const router = useRouter();

 
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsTransitioning(true);
//       setTimeout(() => {
//         setCurrentIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
//         setIsTransitioning(false);
//       }, 500); // Wait for fade out before changing text
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);


//   useEffect(() => {
//     const controlNavbar = () => {
//       if (window.scrollY > lastScrollY) {
//         setVisible(false);
//       } else {
//         setVisible(true);
//       }
//       setLastScrollY(window.scrollY);
//     };

//     window.addEventListener('scroll', controlNavbar);
//     return () => window.removeEventListener('scroll', controlNavbar);
//   }, [lastScrollY]);

//   const clearAllSessionData = () => {
//     document.cookie.split(";").forEach((cookie) => {
//       const cookieName = cookie.split("=")[0].trim();
//       document.cookie = `${cookieName}=; max-age=0; path=/`;
//     });
//     sessionStorage.clear();
//     localStorage.clear();
//   };

//   const handleLogout = async () => {
//     clearAllSessionData();
//     await signOut({ callbackUrl: "/" });
//   };

//   const handleSearch = (e) => {
//     e.preventDefault();
//     const query = searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText.trim();
//     router.push(`/search/${encodeURIComponent(query)}`);
//     setIsMenuOpen(false);
//   };

  

//   const searchInputClass = `
//     p-2 pl-10 w-[700px] border border-[#B0B3B8] rounded-lg bg-white 
//     focus:outline-none focus:ring-2 focus:ring-[#8B77F9] focus:border-transparent 
//     transition-all duration-300
//     placeholder-shown:text-[#B0B3B8]
//     relative
//     ${isTransitioning ? 'animate-placeholder-exit' : 'animate-placeholder-enter'}
//   `;

// // Add these styles to your global CSS file (globals.css)
// const globalStyles = `
//   @keyframes placeholderExit {
//     0% {
//       opacity: 1;
//       transform: translateY(0);
//     }
//     100% {
//       opacity: 0;
//       transform: translateY(-10px);
//     }
//   }

//   @keyframes placeholderEnter {
//     0% {
//       opacity: 0;
//       transform: translateY(10px);
//     }
//     100% {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }

//   .animate-placeholder-exit input::placeholder {
//     animation: placeholderExit 1.0s ease-out forwards;
//   }

//   .animate-placeholder-enter input::placeholder {
//     animation: placeholderEnter 1.05s ease-out forwards;
//   }
// `;


//   return (
//     <>
//     <style jsx global>{globalStyles}</style>
//     <nav className={`fixed top-0 w-full transition-transform duration-300 ease-in-out ${
//       visible ? 'translate-y-0' : '-translate-y-full'
//     } bg-[#F0F2F5] p-4 shadow-md z-50 backdrop-blur-sm bg-opacity-95`}>
//       <div className="max-w-7xl mx-auto">
//         {/* Desktop Navigation */}
//         <div className="hidden lg:flex justify-between items-center">
//           <div className="flex space-x-6 items-center">
//             <div className="text-2xl font-bold text-[#1877F2] hover:text-[#8B77F9] transition-colors">
//               <Link href="/">The Interview</Link>
//             </div>
//             <div className="flex space-x-4">
//               <Link href="/home" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//                 <Home size={24} className="text-[#1877F2]" />
//                 <span className="text-sm mt-1">Home</span>
//               </Link>
//               <Link href="/post" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//                 <FileText size={24} className="text-[#1877F2]" />
//                 <span className="text-sm mt-1">Post</span>
//               </Link>
//             </div>
//           </div>

//           <form onSubmit={handleSearch} className="flex items-center">
//               <div className="relative overflow-hidden">
//                 <input
//                   type="text"
//                   placeholder={placeholders[currentIndex]}
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   className={searchInputClass}
//                 />
//                 <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B3B8]" />
//               </div>
//               <button type="submit" className="ml-2 p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B77F9]">
//                 <Search size={20} />
//               </button>
//             </form>

//           <div className="flex space-x-4 items-center">
//             <Link href="/profile" className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//               <User size={24} className="text-[#1877F2]" />
//               <span className="text-sm mt-1">Profile</span>
//             </Link>

//             {session ? (
//   <button 
//     onClick={handleLogout} 
//     className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#FF5F5F] transition-all duration-300 text-[#1D1D1D] group"
//   >
//     <LogOut 
//       size={24} 
//       className="text-[#1877F2] group-hover:text-white transition-colors duration-300" 
//     />
//     <span className="text-sm mt-1 group-hover:text-white transition-colors duration-300">Logout</span>
//   </button>
// ) : (
//   <button 
//     onClick={() => signIn("google")} 
//     className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D] group"
//   >
//     <LogIn 
//       size={24} 
//       className="text-[#1877F2] group-hover:text-[#1877F2] transition-colors duration-300" 
//     />
//     <span className="text-sm mt-1">Login</span>
//   </button>
// )}
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         <div className="lg:hidden">
//           <div className="flex justify-between items-center">
//             <div className="text-xl font-bold text-[#1877F2]">
//               <Link href="/">The Interview</Link>
//             </div>
//             <div className="flex items-center space-x-4">
//               {/* Search Icon */}
//               <button
//                 onClick={() => setIsMenuOpen(true)}
//                 className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
//               >
//                 <Search size={24} className="text-[#1877F2]" />
//               </button>
//               {/* Hamburger Menu */}
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
//               >
//                 {isMenuOpen ? <X size={24} className="text-[#1877F2]" /> : <Menu size={24} className="text-[#1877F2]" />}
//               </button>
//             </div>
//           </div>

//           {/* Mobile Menu */}
//           <div className={`${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
//             <form onSubmit={handleSearch} className="mb-4">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder={placeholders[currentIndex]} 
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   className="w-full p-2 pl-10 border border-[#B0B3B8] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B77F9] focus:border-transparent"
//                 />
//                 <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#B0B3B8]" />
//               </div>
//               <button type="submit" className="w-full mt-2 p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300">
//                 Search
//               </button>
//             </form>

//             <div className="flex flex-col space-y-2">
//               <Link href="/home" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//                 <Home size={24} className="text-[#1877F2]" />
//                 <span>Home</span>
//               </Link>
//               <Link href="/post" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//                 <FileText size={24} className="text-[#1877F2]" />
//                 <span>Post</span>
//               </Link>
//               <Link href="/profile" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]">
//                 <User size={24} className="text-[#1877F2]" />
//                 <span>Profile</span>
//               </Link>
//               {session ? (
//   <button 
//     onClick={handleLogout} 
//     className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#FF5F5F] transition-all duration-300 text-[#1D1D1D] w-full group"
//   >
//     <LogOut 
//       size={24} 
//       className="text-[#1877F2] group-hover:text-white transition-colors duration-300" 
//     />
//     <span className="group-hover:text-white transition-colors duration-300">Logout</span>
//   </button>
// ) : (
//   <button 
//     onClick={() => signIn("google")} 
//     className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D] w-full group"
//   >
//     <LogIn 
//       size={24} 
//       className="text-[#1877F2] group-hover:text-[#1877F2] transition-colors duration-300" 
//     />
//     <span>Login</span>
//   </button>
// )}
//             </div>
//           </div>
//         </div>

//       </div>
//     </nav>
//     </>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, FileText, LogOut, Search, User, LogIn, Menu, X } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const [searchText, setSearchText] = useState("");
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const texts = [" company ", " batch ", " role " , " person "];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const router = useRouter();

  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  const clearAllSessionData = () => {
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=; max-age=0; path=/`;
    });
    sessionStorage.clear();
    localStorage.clear();
  };

  const handleLogout = async () => {
    clearAllSessionData();
    await signOut({ callbackUrl: "/" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchText.trim() === "" ? "Himanshu-Nilay-Neeraj" : searchText.trim();
    router.push(`/search/${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  };



  return (
    <>
      <nav
        className={`fixed top-0 w-full transition-transform duration-300 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        } bg-[#F0F2F5] p-4 shadow-md z-50 backdrop-blur-sm bg-opacity-95`}
      >
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center">
            <div className="flex space-x-6 items-center">
              <div className="text-2xl font-bold text-[#1877F2] hover:text-[#8B77F9] transition-colors">
                <Link href="/">The Interview</Link>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/home"
                  className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
                >
                  <Home size={24} className="text-[#1877F2]" />
                  <span className="text-sm mt-1">Home</span>
                </Link>
                <Link
                  href="/post"
                  className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
                >
                  <FileText size={24} className="text-[#1877F2]" />
                  <span className="text-sm mt-1">Post</span>
                </Link>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  className="p-3 pr-4 text-lg border rounded-lg shadow-md w-[700px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search for "
                />
                {!searchText && (
                  <div className="absolute top-[25px] left-[100px] transform -translate-y-1/2 overflow-hidden h-6 w-24">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={index}
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "100%", opacity: 0.8 }}
                        transition={{ duration: 0.7 }}
                        className="absolute w-full text-lg text-[#1877F2]"
                      >
                        {texts[index]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="ml-2 p-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B77F9]"
              >
                <Search size={20} />
              </button>
            </form>

            <div className="flex space-x-4 items-center">
              <Link
                href="/profile"
                className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
              >
                <User size={24} className="text-[#1877F2]" />
                <span className="text-sm mt-1">Profile</span>
              </Link>

              {session ? (
  <button 
    onClick={handleLogout} 
    className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#FF5F5F] transition-all duration-300 text-[#1D1D1D] group"
  >
    <LogOut 
      size={24} 
      className="text-[#1877F2] group-hover:text-white transition-colors duration-300" 
    />
    <span className="text-sm mt-1 group-hover:text-white transition-colors duration-300">Logout</span>
  </button>
) : (
  <button 
    onClick={() => signIn("google")} 
    className="flex flex-col items-center px-3 py-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D] group"
  >
    <LogIn 
      size={24} 
      className="text-[#1877F2] group-hover:text-[#1877F2] transition-colors duration-300" 
    />
    <span className="text-sm mt-1">Login</span>
  </button>
)}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold text-[#1877F2]">
                <Link href="/">The Interview</Link>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search Icon */}
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
                >
                  <Search size={24} className="text-[#1877F2]" />
                </button>
                {/* Hamburger Menu */}
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
                >
                  {isMenuOpen ? (
                    <X size={24} className="text-[#1877F2]" />
                  ) : (
                    <Menu size={24} className="text-[#1877F2]" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${isMenuOpen ? "block" : "hidden"} mt-4`}>
              <form onSubmit={handleSearch} className="flex flex-col items-center w-full space-y-2">
                {/* Search Bar */}
                <div className="relative w-full">
                  <input
                    type="text"
                    className="p-3 pl-4 text-lg border rounded-lg shadow-md w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search for"
                  />
                  <div className="absolute top-[24px] left-[105px] transform -translate-y-1/2 overflow-hidden h-6 w-24">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={index}
                        initial={{ y: "-100%", opacity: 0 }}
                        animate={{ y: "0%", opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute w-full text-lg text-[#1877F2]"
                      >
                        {texts[index]}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                {/* Search Button */}
                <button
                  type="submit"
                  className="p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#8B77F9] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B77F9] w-full text-center"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  href="/home"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
                >
                  <Home size={24} className="text-[#1877F2]" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/post"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
                >
                  <FileText size={24} className="text-[#1877F2]" />
                  <span>Post</span>
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D]"
                >
                  <User size={24} className="text-[#1877F2]" />
                  <span>Profile</span>
                </Link>
                {session ? (
  <button 
    onClick={handleLogout} 
    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#FF5F5F] transition-all duration-300 text-[#1D1D1D] w-full group"
  >
    <LogOut 
      size={24} 
      className="text-[#1877F2] group-hover:text-white transition-colors duration-300" 
    />
    <span className="group-hover:text-white transition-colors duration-300">Logout</span>
  </button>
) : (
  <button 
    onClick={() => signIn("google")} 
    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300 text-[#1D1D1D] w-full group"
  >
    <LogIn 
      size={24} 
      className="text-[#1877F2] group-hover:text-[#1877F2] transition-colors duration-300" 
    />
    <span>Login</span>
  </button>
)}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
