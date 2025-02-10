import React from 'react';
import Navbar from '@/components/Navbar';
const TermsPage = () => {
    return (
               <div className="min-h-screen bg-[#F0F2F5]">
            <Navbar />
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-700">
        This is the Terms of Service page content. Add your terms of service details here.
      </p>
            </div>
        </div>
  );
};

export default TermsPage; 