'use client'

import { useState ,useEffect ,useRef} from 'react'
import Link from 'next/link'


    


export default function Home() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const mobileMenuRef = useRef(null);
  
    // Toggle mobile menu
    const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    };
  const featuredStories = [
    {
      company: 'Google',
      role: 'Software Engineer',
      description: 'Comprehensive interview process with focus on algorithms and system design...',
      logo: 'G',
      bgColor: 'bg-blue-500',
      timestamp: '2 days ago',
      level: 'L5'
    },
    {
      company: 'Microsoft',
      role: 'Product Manager',
      description: 'Strong emphasis on leadership principles and behavioral questions...',
      logo: 'M',
      bgColor: 'bg-red-400',
      timestamp: '1 week ago',
      level: 'Senior'
    },
    {
      company: 'Amazon',
      role: 'Data Scientist',
      description: 'Deep dive into machine learning concepts and system design...',
      logo: 'A',
      bgColor: 'bg-green-500',
      timestamp: '3 days ago',
      level: 'L4'
    }
  ]

  const topStories = [
    {
      company: 'Apple',
      role: 'iOS Developer',
      description: 'Interviewed for a mobile app development position focusing on Swift and Objective-C...',
      logo: 'A',
      bgColor: 'bg-gray-700',
      timestamp: '5 days ago',
      level: 'L4'
    },
    {
      company: 'Netflix',
      role: 'Backend Engineer',
      description: 'Challenging system design interview focused on distributed systems and performance...',
      logo: 'N',
      bgColor: 'bg-red-700',
      timestamp: '1 month ago',
      level: 'L5'
    },
    {
      company: 'Spotify',
      role: 'Data Engineer',
      description: 'Interview process included data modeling, SQL optimization, and data pipeline design...',
      logo: 'S',
      bgColor: 'bg-green-700',
      timestamp: '2 weeks ago',
      level: 'Senior'
    }
  ]

  const companyTips = [
    {
      name: 'Google Interview Tips',
      icon: 'G',
      iconBg: 'bg-blue-500',
      tips: [
        'Focus on algorithmic efficiency and scalability',
        'Practice system design for senior roles',
        'Prepare for behavioral questions using STAR method'
      ]
    },
    {
      name: 'Meta Interview Tips',
      icon: 'M',
      iconBg: 'bg-purple-500',
      tips: [
        'Strong emphasis on coding performance',
        'Focus on product sense and impact',
        'Practice cross-functional collaboration scenarios'
      ]
    },
    {
      name: 'Amazon Interview Tips',
      icon: 'A',
      iconBg: 'bg-red-400',
      tips: [
        'Study Leadership Principles thoroughly',
        'Prepare ownership and scalability examples',
        'Focus on metrics and results in answers'
      ]
    }
  ]

  const blogPosts = [
    {
      author: 'Sarah Miller',
      title: 'Tech Lead at Google',
      avatar: 'S',
      avatarBg: 'bg-purple-500',
      content: 'How to Ace System Design Interviews: A Comprehensive Guide'
    },
    {
      author: 'Raj Patel',
      title: 'Senior PM at Meta',
      avatar: 'R',
      avatarBg: 'bg-blue-500',
      content: 'Product Sense: Key Frameworks for PM Interviews'
    },
    {
      author: 'Jessica Chen',
      title: 'Data Scientist at Amazon',
      avatar: 'J',
      avatarBg: 'bg-green-500',
      content: 'Machine Learning Interview Questions Decoded'
    }
  ]

  const [activeFilter, setActiveFilter] = useState('FAANG')

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY) {
          // Scrolling down
          setVisible(false);
        } else {
          // Scrolling up
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.md:hidden')) {
        setIsMobileMenuOpen(false);
      }
    };

    // Add event listener to handle outside click
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav
  className={`fixed top-0 w-full pb-2 transition-transform duration-300 ease-in-out ${
    visible ? "translate-y-0" : "-translate-y-full"
  } bg-gray-100 shadow-sm z-50`}
>
  <div className="flex justify-between items-center px-4 py-4 md:px-8">
    {/* Logo */}
    <Link href="/" className="text-blue-600 text-2xl font-bold">
      TheInterview
    </Link>

    {/* Hamburger for mobile */}
    <div className="md:hidden" onClick={toggleMobileMenu}>
      <button className="text-gray-800 focus:outline-none p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>

    {/* Desktop Menu */}
    <div className="hidden md:flex gap-8 items-center">
      {/* Home Link */}
      <Link href="/home" className="text-gray-800 hover:text-blue-600 transition duration-300">
        Home
      </Link>
      <Link href="#featured" className="text-gray-800 hover:text-blue-600 transition duration-300">
        Featured Stories
      </Link>
      <Link href="#topstories" className="text-gray-800 hover:text-blue-600 transition duration-300">
        Top Stories
      </Link>
      <Link href="#companyspecific" className="text-gray-800 hover:text-blue-600 transition duration-300">
        Company Tips
      </Link>
      <Link href="/post" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
        Share Experience
      </Link>
    </div>
  </div>

  {/* Mobile Menu */}
  {isMobileMenuOpen && (
    <div className="fixed top-0 left-0 w-full h-full z-50 md:hidden">
      <div className="flex justify-between items-center p-4 border-b bg-gray-100">
        <Link href="/" className="text-blue-600 text-2xl font-bold">
          TheInterview
        </Link>
        <button onClick={toggleMobileMenu} className="text-gray-800 focus:outline-none p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4 bg-gray-100">
        {/* Mobile Home Link */}
        <Link href="/home" className="text-gray-800 hover:text-blue-600 transition duration-300" onClick={toggleMobileMenu}>
          Home
        </Link>
        <Link href="#featured" className="text-gray-800 hover:text-blue-600 transition duration-300" onClick={toggleMobileMenu}>
          Featured Stories
        </Link>
        <Link href="#topstories" className="text-gray-800 hover:text-blue-600 transition duration-300" onClick={toggleMobileMenu}>
          Top Stories
        </Link>
        <Link href="#companyspecific" className="text-gray-800 hover:text-blue-600 transition duration-300" onClick={toggleMobileMenu}>
          Company Tips
        </Link>
        <Link href="/post" className="bg-blue-600 text-white pl-1 pr-1 py-1 rounded-lg hover:bg-blue-700 transition duration-300 text-center" onClick={toggleMobileMenu}>
          Share Experience
        </Link>
      </div>
    </div>
  )}
</nav>


      {/* Hero Section */}
      <section className="bg-white text-center py-12 mt-20 px-4">
        <h1 className="text-5xl font-bold mb-4">
          Share Your <span className="text-blue-600">Interview</span> Journey
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Learn from real experiences. Share your story. Help others succeed.
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link href="/home"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            Read Stories
          </Link>
          <Link href="/post"
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 font-medium">
            Share Your Story
          </Link>
        </div>
      </section>

      {/* Featured Stories */}
      <section id="featured" className="bg-gray-100 py-16 px-[5%] text-center">
        <h2 className="text-4xl font-bold mb-8">Featured Interview Stories</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 mb-8">
          {featuredStories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm min-w-[300px]">
              <div className="flex items-center gap-4 mb-4">
                <div className={`${story.bgColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
                  {story.logo}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">{story.company}</h3>
                  <p className="text-gray-600">{story.role}</p>
                </div>
              </div>
              <p className="text-left mb-4">{story.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">{story.timestamp}</span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {story.level}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/home"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            View All Stories
          </Link>
          <Link href="/post"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
            Share Your Experience
          </Link>
        </div>
      </section>

      {/* Company Specific Tips */}
      <section id="companyspecific" className="py-16 px-4 sm:px-8 bg-white">
  <h2 className="text-4xl font-bold text-center mb-8">Company-Specific Interview Tips</h2>

  <div className="flex justify-center gap-4 mb-8 flex-wrap">
    {['FAANG', 'Startups', 'Product Companies'].map((filter) => (
      <button
        key={filter}
        onClick={() => setActiveFilter(filter)}
        className={`px-6 py-3 rounded-full text-lg transition-colors ${
          activeFilter === filter
            ? 'bg-[#8B77F9] text-white'
            : 'bg-white text-black border border-gray-400'
        }`}
      >
        {filter}
      </button>
    ))}
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {companyTips.map((company, index) => (
      <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className={`${company.iconBg} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
            {company.icon}
          </div>
          <div className="font-bold text-lg">{company.name}</div>
        </div>
        <ul className="space-y-3 text-sm">
          {company.tips.map((tip, tipIndex) => (
            <li key={tipIndex} className="flex items-start gap-2">
              <span className="text-[#00C853] text-lg">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</section>


      {/* Top Stories */}
      <section id="topstories" className="bg-white py-16 px-[5%] text-center">
        <h2 className="text-4xl font-bold mb-8">Top Interview Stories</h2>
        
        <div className="flex gap-6 overflow-x-auto pb-6 mb-8">
          {topStories.map((story, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm min-w-[300px]">
              <div className="flex items-center gap-4 mb-4">
                <div className={`${story.bgColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
                  {story.logo}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">{story.company}</h3>
                  <p className="text-gray-600">{story.role}</p>
                </div>
              </div>
              <p className="text-left mb-4">{story.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">{story.timestamp}</span>
                <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                  {story.level}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/home"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            View All Stories
          </Link>
          <Link href="/post"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
            Share Your Experience 
          </Link>
        </div>
      </section>

      

      {/* Blog Section */}
      <section className="bg-gray-900 text-white py-16 px-[5%]">
        <h2 className="text-4xl font-bold text-center mb-12">What Community Says</h2>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-6">
            {blogPosts.map((post, index) => (
              <article key={index} className="bg-gray-800 rounded-xl p-6 min-w-[300px]">
                <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${post.avatarBg} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold`}>
                    {post.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{post.author}</div>
                    <div className="text-gray-400 text-sm">{post.title}</div>
                  </div>
                </div>
                <div className="text-lg">{post.content}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
