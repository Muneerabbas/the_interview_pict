"use client";

import React from 'react';
import MdxEditorPage from "../../components/ExpForm";
import Login from "../../components/Login"; // Importing the Login component
import { useSession } from 'next-auth/react'; // If using next-auth, for example

export default function Post() {
  const { data: session, status } = useSession(); // Check session status (adjust for your session system)

  if (status === "loading") {
    // Optionally, show a loading state while the session is being determined
    return <div>Loading...</div>;
  }

  if (!session) {
    // If no session exists, show the login prompt
    return (
      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="p-6 bg-white shadow-lg rounded-lg -mt-[300px]">
          <p className="text-lg font-bold mb-4">
            You must be logged in to Post
          </p>
          <Login /> {/* Render the Login component */}
        </div>
      </div>
    );
  }

  // If the session exists, render the content
  return <MdxEditorPage />;
}
