import React from 'react';
import Navbar from "@/components/Navbar";
const PrivacyPage = () => {
    return (
         <div className="min-h-screen bg-[#F0F2F5] pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Navbar showThemeToggle />
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <p className="text-gray-700 dark:text-slate-300">
        This is the Privacy Policy page content. Add your privacy policy details here.
      </p>
            </div>
           </div>
  );
};

export default PrivacyPage;
