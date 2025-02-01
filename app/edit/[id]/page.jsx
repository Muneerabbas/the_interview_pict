"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation"; // Using useParams from next/navigation
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar"; // Imported Navbar component

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MdxEditorPage() {
  const { data: session } = useSession();
  const { id } = useParams(); // useParams hook to get the `id` parameter from the URL
  const [markdown, setMarkdown] = useState("");
  const [height, setHeight] = useState("100vh");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [expData, setExpData] = useState(null);

  // Update the editor height based on the window size
  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.innerHeight - 120;
      setHeight(`${newHeight}px`);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Fetch the experience data when `id` is available
  const fetchExperienceData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/exp?uid=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setExpData(data);
      setMarkdown(data.exp_text);
      setBatch(data.batch);
      setBranch(data.branch);
      setCompany(data.company);
      setRole(data.role);
    } catch (error) {
      console.error("Error fetching experience data:", error);
    }
  };

  // Handle the form submission and save the data
  const handleSubmit = async () => {
    try {
      const email = session?.user?.email || "Unknown";
      const name = session?.user?.name || "Anonymous";
      const profile_pic = session?.user?.image || "";
      const response = await fetch("/api/edit/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: id,
          exp_text: markdown,
          name,
          batch,
          branch,
          company,
          role,
          email,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to submit markdown");
      }
      alert("Markdown submitted successfully!");
    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
    }
  };

  // Fetch data whenever the `id` changes
  useEffect(() => {
    if (id) {
      fetchExperienceData();
    }
  }, [id]);

  return (
    <div className="flex flex-col h-screen">
  {/* Navbar rendered first */}
  <Navbar />

  <div className="lg:mt-[120px] md:mt-[80px] sm:mt-[100px]">
    <div className="max-w-7xl mx-auto">
      {/* Dropdowns and Submit Button aligned in the same row */}
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
        
        {/* Submit Button aligned to the right */}
        <button
          onClick={handleSubmit}
          className="ml-auto px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          Submit
        </button>
      </div>

      {/* Markdown editor container */}
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
