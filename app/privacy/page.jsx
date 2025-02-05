import React from 'react';
import Navbar from "@/components/Navbar";
const PrivacyPage = () => {
    return (
         <div className="min-h-screen bg-[#F0F2F5]">
            <Navbar />
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-700">
        This is the Privacy Policy page content. Add your privacy policy details here.
      </p>
            </div>
           </div>
  );
};

export default PrivacyPage;