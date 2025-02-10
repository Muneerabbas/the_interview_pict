import React from 'react';
import Navbar from '@/components/Navbar';
const TeamPage = () => {
    return (
               <div className="min-h-screen bg-[#F0F2F5]">
            <Navbar />
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">The Interview Team</h1>
      <p className="text-gray-700">
        This page will showcase the team behind "theInterview". You can add team member profiles, bios, etc.
      </p>
      <p className="text-gray-700 mt-4">
         <a href="YOUR_EXTERNAL_LINK_HERE" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            External Team Page Link (Replace with your actual external link)
         </a>
      </p>
            </div>
        </div>
  );
};

export default TeamPage;