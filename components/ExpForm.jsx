import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { 
  ssr: false 
});

export default function MdxEditorPage() {
  const [markdown, setMarkdown] = useState("");
  const [height, setHeight] = useState("100vh");

  // State for dropdowns
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState(""); // New state for Role

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = window.innerHeight - 120;
      setHeight(`${newHeight}px`);
    };

    // Add custom styles for larger icons and text
    const style = document.createElement('style');
    style.textContent = `
      .w-md-editor-toolbar svg {
        width: 20px !important;
        height: 20px !important;
      }
      .w-md-editor-toolbar > ul > li > button {
        padding: 12px !important;
        margin: 0 2px !important;
      }
      .w-md-editor-toolbar {
        padding: 8px !important;
      }
      .w-md-editor-text {
        font-size: 1.6rem !important;
        line-height: 1.6rem !important;
      }
      .w-md-editor-text-pre > code,
      .w-md-editor-text-input {
        font-size: 1.8rem !important;
        line-height: 1.8rem !important;
      }
      .w-md-editor-preview {
        font-size: 1.75rem !important;
        line-height: 1.75rem !important;
      }
      .w-md-editor-preview h1 {
        font-size: 1.75rem !important;
      }
      .w-md-editor-preview h2 {
        font-size: 1.75rem !important;
      }
      .w-md-editor-preview h3 {
        font-size: 1.75rem !important;
      }
      .w-md-editor-preview p {
        margin: 1.75rem 0 !important;
      }
    `;
    document.head.appendChild(style);

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      document.head.removeChild(style);
    };
  }, []);

  const handleSubmit = async () => {
    try {
      const email = localStorage.getItem('email');
      const name = localStorage.getItem('name');
      const profile_pic = localStorage.getItem('image');

      const response = await fetch("/api/saveExp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          exp_text: markdown,  
          name, 
          profile_pic,
          batch,
          branch,
          company,
          role, // Send the selected role
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-gray-800">
            MDX Editor
          </h1>
          
          <div className="flex space-x-4 mb-4">
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

            {/* New Role dropdown */}
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

          <div className="mt-4">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
