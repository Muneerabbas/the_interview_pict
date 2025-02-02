"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import debounce from 'lodash/debounce';

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MdxEditorPage() {
  const { data: session } = useSession();
  const [markdown, setMarkdown] = useState("");
  const [height, setHeight] = useState("100vh");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  // Load draft on initial render
  useEffect(() => {
    const loadDraft = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch(`/api/drafts?email=${session.user.email}`);
        if (response.ok) {
          const draftData = await response.json();
          setMarkdown(draftData.exp_text || "");
          setBatch(draftData.batch || "");
          setBranch(draftData.branch || "");
          setCompany(draftData.company || "");
          setRole(draftData.role || "");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    loadDraft();
  }, [session?.user?.email]);

  // Create debounced save function
  const saveDraft = useCallback(
    debounce(async (draftData) => {
      if (!session?.user?.email) return;

      try {
        await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...draftData,
            email: session.user.email,
            name: session.user.name,
            profile_pic: session.user.image,
          }),
        });
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, 2000),
    [session]
  );

  // Call saveDraft whenever content changes
  useEffect(() => {
    if (session?.user?.email) {
      saveDraft({
        exp_text: markdown,
        batch,
        branch,
        company,
        role,
      });
    }
  }, [markdown, batch, branch, company, role, saveDraft, session?.user?.email]);

  useEffect(() => {
    const updateHeight = () => {
      setHeight(`${window.innerHeight - 120}px`);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleSubmit = async () => {
    if (!session) {
      alert("You need to be logged in to submit!");
      return;
    }

    try {
      const response = await fetch("/api/saveExp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exp_text: markdown,
          name: session.user.name,
          profile_pic: session.user.image,
          batch,
          branch,
          company,
          role,
          email: session.user.email,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit markdown");
      alert("Markdown submitted successfully!");
    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
    }
  };

  return (
    <div className="flex flex-col h-screen ">
      <Navbar />

      <div className="lg:mt-[120px] md:mt-[80px] sm:mt-[100px]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Batch</option>
              <option value="Batch 1">Batch 1</option>
              <option value="Batch 2">Batch 2</option>
              <option value="Batch 3">Batch 3</option>
            </select>

            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Branch</option>
              <option value="CS">Computer Science</option>
              <option value="IT">Information Technology</option>
              <option value="EC">Electronics</option>
            </select>

            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Company</option>
              <option value="Barclays">Barclays</option>
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
            </select>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Role</option>
              <option value="Intern">Intern</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Freelancer">Freelancer</option>
            </select>

            <button
              onClick={handleSubmit}
              className="ml-auto px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              Submit
            </button>
          </div>

          <div
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
            style={{ height }}
          >
            <MDEditor
              value={markdown}
              onChange={(value) => setMarkdown(value || "")}
              preview="live"
              hideToolbar={false}
              data-color-mode="light"
              className="w-full h-full"
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}