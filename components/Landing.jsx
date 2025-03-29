// LandingPage.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import logo from "../public/icon.svg"
import Image from 'next/image'
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { marked } from 'marked'; // ADDED: Import marked - but will not be used for rendering HTML now
import AdComponent from "@/components/AdComponent";


// Reusable ScrollableSection component
const ScrollableSection = ({ children }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = container.offsetWidth;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto">
  <button
    onClick={() => scroll('left')}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 text-white sm:block" // Darker background, white text
    aria-label="Scroll left"
  >
    <ChevronLeft size={24} />
  </button>
  <div
    ref={scrollContainerRef}
    className="flex gap-6 overflow-x-scroll scroll-smooth px-6 sm:px-12"
  >
    {children}
  </div>
  <button
    onClick={() => scroll('right')}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 text-white sm:block" // Darker background, white text
    aria-label="Scroll right"
  >
    <ChevronRight size={24} />
  </button>
</div>


  );
};

// StoryCard component
const StoryCard = ({ story, avatarColor }) => {
  // Remove markdown formatting characters
  let plainText = story.exp_text || '';

  // Remove bold and italic markers
  plainText = plainText.replace(/\*\*|_/g, '');
  plainText = plainText.replace(/__/g, '');
  plainText = plainText.replace(/\*/g, '');
  plainText = plainText.replace(/_/g, '');

  // Remove headings (lines starting with #, ##, ### etc.)
  plainText = plainText.replace(/^#+\s/gm, ''); // Remove headings like # Heading, ## Subheading

  // Remove lists (unordered and ordered)
  plainText = plainText.replace(/^[\s]*[*+-]\s/gm, ''); // Remove unordered list markers like * item, - item, + item
  plainText = plainText.replace(/^[\s]*\d+\.\s/gm, ''); // Remove ordered list markers like 1. item, 2. item

  // Remove blockquotes (lines starting with >)
  plainText = plainText.replace(/^>\s/gm, ''); // Remove blockquote markers like > quote

  // Remove inline code (``...``)
  plainText = plainText.replace(/`([^`]+)`/g, '$1'); // Replace `code` with code

  // Remove horizontal rules (lines consisting of ---, ***, or ___)
  plainText = plainText.replace(/^[-*_]{3,}$/gm, '');

    // remove extra spaces and lines
    plainText = plainText.replace(/[\r\n]+/g, ' ').trim(); // Replace line breaks with spaces and trim

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm min-w-[280px] max-w-[350px] sm:min-w-[300px] sm:max-w-[300px] hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className={`${avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
          {story.company.charAt(0).toUpperCase()}
        </div>
        <div className="text-left">
          <h3 className="font-bold text-lg">{story.company}</h3>
          <p className="text-gray-600 text-sm sm:text-base">{story.role}</p>
        </div>
      </div>
      <p
        className="text-left mb-2 line-clamp-3 text-sm sm:text-base"
      >
        {plainText}
      </p>
      <p className="text-left text-gray-700 text-xs sm:text-sm mb-2">Batch: {story.batch}</p>
      <div className="flex justify-between items-center">
        <span className="text-gray-600 text-xs sm:text-sm">Reads: {story.views || '0'}</span>
      </div>
    </div>
  );
};


export default function Home({ featuredStories, topStories }) { // Accept fetched stories as props
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null); // ADD: Ref for mobile menu button
  const [isVisible, setIsVisible] = useState(false);
  const [storyCardColors, setStoryCardColors] = useState({});
  const [fetchedFeaturedStories, setFetchedFeaturedStories] = useState(featuredStories || []); // Use props, fallback to empty array
  const [fetchedTopStories, setFetchedTopStories] = useState(topStories || []); // Use props, fallback to empty array
  const [activeSection, setActiveSection] = useState('Home'); // ADD: State to track active section

  const navItems = [
    { href: '/', label: 'Home', sectionId: 'hero' }, // ADD: sectionId, Changed href to "/" for landing page home
    { href: '/about', label: 'About Us', sectionId: 'about' }, // ADDED: About Us nav item
    { href: '/feed', label: 'Feed', sectionId: 'feed' }, // ADDED: Feed nav item
    { href: '#featured', label: 'Featured Stories', sectionId: 'featured' }, // ADD: sectionId
    { href: '#topstories', label: 'Top Stories', sectionId: 'topstories' }, // ADD: sectionId
    { href: '#companyspecific', label: 'Search Experience', sectionId: 'companyspecific' }, // ADD: sectionId
    { href: '/post', label: 'Share Experience', sectionId: 'share' } // ADD: sectionId
  ];

  const blogPosts = [

    {
      author: 'Siddhant Vishnu',
      content: `"Unbelivable stuff from seniors❤️ !Can't ask for more"`,
      avatarBg: "bg-green-600",
      avatar: 'S'
    },
    {
      author: 'Shlok S',
      content: `"Bro abhi job lag jaegi"`,
      avatarBg: "bg-red-400",
      avatar: 'S'
    },
    {
      author: 'Shreya Hiwarkar',
      content: `"Great work ! Really helpful"`,
      avatarBg: "bg-orange-400",
      avatar: 'S'
    },

  ];

  const batchYears = Array.from({ length: 2027 - 2019 }, (_, i) => 2027 - i);
  const branches = ["CS", "IT", "EnTC", "AIDS", "EC"];
  const companies = ["Barclays", "Mastercard", "BNY", "Siemens", "Arista", "Tracelink", "PhonePe"];

  const companyColors = {
    'Barclays': { bg: 'bg-blue-700', text: 'text-blue-700' },
    'Mastercard': { bg: 'bg-red-600', text: 'text-red-600' },
    'BNY': { bg: 'bg-purple-600', text: 'text-purple-600' },
    'Siemens': { bg: 'bg-teal-600', text: 'text-teal-600' },
    'Arista': { bg: 'bg-blue-500', text: 'text-blue-500' },
    'Tracelink': { bg: 'bg-indigo-600', text: 'text-indigo-600' },
    'PhonePe': { bg: 'bg-purple-700', text: 'text-purple-700' },
 };

  const batchColors = {
    2027: 'text-green-500',
    2026: 'text-blue-500',
    2025: 'text-yellow-500',
    2024: 'text-red-500',
    2023: 'text-purple-500',
    2022: 'text-teal-500',
    2021: 'text-orange-500',
    2020: 'text-pink-500',
    2019: 'text-gray-500',
  };

  const branchColors = {
    "CS": 'text-indigo-500',
    "IT": 'text-emerald-500',
    "EnTC": 'text-rose-500',
    "AIDS": 'text-cyan-500',
    "EC": 'text-amber-500'
  }


  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !(mobileMenuButtonRef.current && mobileMenuButtonRef.current.contains(event.target))) { // MODIFIED: Check if click is NOT inside mobile menu button ref
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    const colors = {};
    fetchedFeaturedStories.forEach((story, index) => {
      colors[story.uid] = getRandomColor();
    });
    fetchedTopStories.forEach((story, index) => {
      colors[story.uid] = getRandomColor();
    });
    setStoryCardColors(colors);
  }, [fetchedFeaturedStories, fetchedTopStories]);

  useEffect(() => { // ADD: useEffect to handle active section based on scroll
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.sectionId)).filter(Boolean);
      let currentSection = 'Home'; // Default to Home

      for (const section of sections) {
        if (!section) continue; // Skip if section element is not found

        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) { // Adjust offset as needed
          currentSection = navItems.find(item => item.sectionId === section.id)?.label || currentSection;
          break; // Exit loop once active section is found
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems, setActiveSection]);


  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full transition-transform duration-300 ease-in-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      } bg-[#F0F2F5] p-4 sm:p-7 shadow-md z-50 backdrop-blur-sm bg-opacity-95`}> {/* Padding adjusted for mobile */}
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center">
            <div className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
              <Image src={logo} alt="theInterview Logo" width={40} height={40} />
              <Link href="/" prefetch={true}>theInterview</Link>
            </div>
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`text-gray-800  transition duration-300 rounded-md px-3 py-2 hover:bg-blue-600 hover:text-white ${activeSection === item.label ? 'font-semibold text-white bg-blue-600 ' : 'hover:bg-blue-600 hover:text-white'} ${item.label === 'Share Experience' ? 'bg-gray-200 shadow-md hover:bg-blue-600' : ''}`} // ADD: Hover and Active styling + Button styling for Share Experience
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xl font-bold text-blue-600">
                <Image src={logo} alt="theInterview Logo" width={40} height={40} />
                <Link href="/" prefetch={true}>theInterview</Link>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 rounded-lg hover:bg-[#E7F3FF] transition-all duration-300"
                ref={mobileMenuButtonRef} // ADD: Ref to mobile menu button
              >
                {isMobileMenuOpen ? (
                  <X size={28} className="text-blue-600" />
                ) : (
                  <Menu size={28} className="text-blue-600" />
                )}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="absolute left-0 right-0 top-full bg-[#F0F2F5] shadow-md" ref={mobileMenuRef}>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    className={`block p-4 text-gray-800 transition-colors duration-300 rounded-md hover:bg-blue-600 hover:text-white ${activeSection === item.label ? 'font-semibold text-blue-600 bg-blue-100' : 'hover:bg-blue-100 hover:text-blue-600'} ${item.label === 'Share Experience' ? 'bg-gray-200 shadow-md hover:bg-gray-300' : ''}`} // ADD: Hover and Active styling for mobile + Button styling for Share Experience
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="bg-white text-center py-12 mt-16 sm:mt-24 px-4"> {/* Adjusted marginTop for mobile */}
        <div className={`transform transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
        }`}>
          {/* Ad Placement */}
      {/* <AdComponent slot="4811519147" /> */}

          <div className="relative w-20 h-20 mx-auto mb-6 sm:mb-8"> {/* Adjusted marginBottom for mobile */}
            <Image
              src={logo}
              alt="theInterview Logo"
              fill
              className="object-contain animate-bounce"
            />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Share Your <span className="text-blue-600">Interview</span> Journey 🚀
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
            Learn from real experiences. Share your story. Help others succeed. ✨
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 sm:mb-12"> {/* Stacked buttons on mobile */}
            <Link
              href="/feed"
              prefetch={true}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium transition-all duration-300 hover:scale-105"
            >
              Read Stories 📖
            </Link>
            <Link
              href="/post"
              prefetch={true}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300 hover:scale-105 shadow-md" // Styled button
            >
              Share Your Story ✍️
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section id="featured" className="bg-gray-100 py-12 sm:py-16 text-center px-4"> {/* Adjusted padding for mobile */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Featured Interview Stories 🌟</h2> {/* Adjusted font size for mobile */}
        <ScrollableSection>
          {fetchedFeaturedStories.map((story, index) => (
            <Link key={index} href={`/single/${story.uid}`} prefetch={true}>
              <StoryCard story={story} avatarColor={storyCardColors[story.uid]} />
            </Link>
          ))}
        </ScrollableSection>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6 sm:mt-8"> {/* Stacked buttons on mobile */}
          <Link href="/feed" prefetch={true} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            View All Stories 📚
          </Link>
          <Link href="/post" prefetch={true} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 shadow-md">  {/* Styled button */}
            Share Your Experience 📝
          </Link>
        </div>
      </section>

      {/* Company Specific Tips Section - Renamed to Search by Company for clarity */}
      <section id="companyspecific" className="py-12 sm:py-16 px-4 bg-white"> {/* Adjusted padding for mobile */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">Search Experiences By 🔍</h2> {/* Adjusted font size for mobile */}

        <div className="mb-10 sm:mb-12"> {/* Adjusted marginBottom for mobile */}
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">🏢 Company</h3> {/* Adjusted font size for mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"> {/* Adjusted grid gap for mobile */}
            {companies.map((company) => (
              <Link key={company} href={`/search/${company}`} prefetch={true}>
                <div className={`bg-white border border-gray-200 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-center hover:shadow-md transition-shadow duration-200 text-sm sm:text-base ${companyColors[company].text} font-semibold`}> {/* Adjusted padding and font size for mobile */}
                  {company}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search by Batch */}
        <div className="mb-10 sm:mb-12"> {/* Adjusted marginBottom for mobile */}
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">🎓 Batch</h3> {/* Adjusted font size for mobile */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3 sm:gap-4"> {/* Adjusted grid gap for mobile */}
            {batchYears.map((year) => (
              <Link key={year} href={`/search/${year}`} prefetch={true}>
                <div className={`bg-white border border-gray-200 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-center hover:shadow-md transition-shadow duration-200 text-sm sm:text-base ${batchColors[year]} font-semibold`}> {/* Adjusted padding and font size for mobile */}
                  {year}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search by Branch */}
        <div className="mb-10 sm:mb-12"> {/* Adjusted marginBottom for mobile */}
          <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">🌱 Branch</h3> {/* Adjusted font size for mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4"> {/* Adjusted grid gap for mobile */}
            {branches.map((branch) => (
              <Link key={branch} href={`/search/${branch}`} prefetch={true}>
                <div className={`bg-white border border-gray-200 rounded-lg py-2 sm:py-3 px-3 sm:px-4 text-center hover:shadow-md transition-shadow duration-200 text-sm sm:text-base ${branchColors[branch]} font-semibold`}> {/* Adjusted padding and font size for mobile */}
                  {branch}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* Top Stories */}
      <section id="topstories" className="bg-gray-100 py-12 sm:py-16 px-4 text-center"> {/* Adjusted padding for mobile */}
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Top Interview Stories 🔥</h2> {/* Adjusted font size for mobile */}
        <ScrollableSection>
          {fetchedTopStories.map((story, index) => (
            <Link key={index} href={`/single/${story.uid}`} prefetch={true}>
              <StoryCard story={story} avatarColor={storyCardColors[story.uid]} />
            </Link>
          ))}
        </ScrollableSection>
      </section>

      {/* Blog Section */}
      <section className="bg-white text-gray-900 py-12 sm:py-16 px-4"> {/* Adjusted padding for mobile */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12">What Community Says 💬</h2> {/* Adjusted font size for mobile */}
        <ScrollableSection>
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-gray-100 rounded-xl shadow-sm p-4 sm:p-6 min-w-[280px] max-w-[350px] sm:min-w-[300px] sm:max-w-[300px] transition-transform" // Adjusted padding and width for mobile
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`${post.avatarBg} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`}>
                  {post.avatar}
                </div>
                <div>
                  <div className="font-bold text-lg">{post.author}</div>
                  <div className="text-gray-600 text-sm">{post.title}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base">{post.content}</p> {/* Adjusted font size for mobile */}
            </article>
          ))}
        </ScrollableSection>
      </section>
    </main>
  );
}