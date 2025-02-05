import React from 'react';
import Navbar from "@/components/Navbar";
const AboutPage = () => {
    return (
               <div className="min-h-screen bg-[#F0F2F5]">
            <Navbar />
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <p className="text-gray-700">
        This is the About Us page content. You can add your company information, mission, and team details here.
      </p>
            </div>
        </div>

  );
};

export default AboutPage;