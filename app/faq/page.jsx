import React from 'react';
import Navbar from '@/components/Navbar';
const FAQPage = () => {
    return (
               <div className="min-h-screen bg-[#F0F2F5]">
            <Navbar />
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">FAQ</h1>
      <p className="text-gray-700">
        This is the FAQ page content. Add frequently asked questions and answers here.
      </p>
            </div>
          </div>
  );
};

export default FAQPage;