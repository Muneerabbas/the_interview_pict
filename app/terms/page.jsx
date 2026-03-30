import React from 'react';
import Navbar from '@/components/Navbar';
const TermsPage = () => {
    return (
               <div className="min-h-screen bg-[#F0F2F5] pt-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Navbar showThemeToggle />
    <div className="container mx-auto px-4 py-10">
      <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
      <p className="text-gray-700 dark:text-slate-300">
        This is the Terms of Service page content. Add your terms of service details here.
      </p>
            </div>
        </div>
  );
};

export default TermsPage; 
