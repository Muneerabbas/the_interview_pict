'use client'

import { useRef } from 'react'; // Make sure useRef is imported here if needed
import { ChevronLeft, ChevronRight } from "lucide-react"; // and Chevron icons

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
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 text-white sm:block"
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
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 text-white sm:block"
    aria-label="Scroll right"
  >
    <ChevronRight size={24} />
  </button>
</div>
  );
};

export default ScrollableSection;