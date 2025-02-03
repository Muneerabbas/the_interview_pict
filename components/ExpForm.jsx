"use client";
import React, { useEffect, useState, useCallback ,useRef} from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import debounce from "lodash/debounce";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const dummyText = `---
title: "Interview Experience - [Company Name]"
role: "[Job Role]"
---

## Introduction
<!-- Start with a brief introduction about your experience, including the company and role. -->
I recently interviewed for the **[Job Role]** position at **[Company Name]**. Here's a summary of my experience and what I learned during the process.

## Application Process
<!-- Describe how you applied for the role (e.g., referral, campus placement, online application, etc.). -->
I applied for the role via **[method, e.g., online portal, campus placement, referral, etc.]**. The application process was straightforward, and I received a response within **[time frame, e.g., 1 week]**.

## Interview Rounds
<!-- Structure your interview process in multiple rounds -->

### Round 1: **[Online Assessment / Coding Challenge]**
<!-- Mention the format, duration, and topics covered -->
The first round was an **[online coding assessment / technical interview]** that lasted for **[Duration]**. It included:
- **[Number of coding questions]** coding problems focusing on **[Topics like Arrays, Dynamic Programming, Graphs, etc.]**
- MCQs on **[e.g., Algorithms, Data Structures, CS fundamentals]**

### Round 2: **Technical Interview**
<!-- Describe the questions asked, difficulty level, and your approach -->
- **Question 1:** [Describe the problem briefly]
  - My Approach: [Explain how you solved it. Discuss the logic, optimizations, or challenges you faced.]
  
- **Question 2:** [Another question you were asked]
  - My Approach: [Your explanation of how you approached the question. Mention any tools or frameworks used if applicable.]

### Round 3: **HR Interview**
<!-- Mention behavioral questions and discussion topics -->
The HR round was more about my background, motivations, and culture fit. Some questions I was asked:
- **Tell me about yourself.**
- **Why do you want to join [Company Name]?**
- **What are your long-term career goals?**
- **Do you have any questions for us?**

## Preparation Tips
<!-- Share useful tips and resources -->
Here's what helped me prepare:

- **DSA Practice:** [Platforms like LeetCode, CodeForces, HackerRank, etc. helped me prepare for coding rounds. My advice: solve problems on these platforms regularly.]
- **System Design:** [Books like "Designing Data-Intensive Applications" or YouTube channels like Gaurav Sen's channel are great resources.]
- **Mock Interviews:** [I practiced with mock interview platforms like InterviewBit, Pramp, or even with friends.]
  
## Final Outcome
<!-- Share if you were selected or got feedback -->
I **[was selected / am still waiting for results / received feedback]** after the interview rounds.

## Useful Links
<!-- Provide links to resources, your LinkedIn post, or discussion forums -->
- [My LinkedIn Profile](https://www.linkedin.com/in/[your-profile])
- [LeetCode Profile](https://leetcode.com/[your-username])
- [Some useful resources or blogs you've found helpful](#)

---

Feel free to reach out to me if you have any questions or need further clarification on any part of the interview process. Good luck with your interview preparation!`;
  

export default function MdxEditorPage() { 
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session } = useSession();
  const [companies, setCompanies] = useState([]);
  const editorRef = useRef(null);
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [role, setRole] = useState("");
  const [height,setHeight] =useState("100vh");
  const [bottomMargin,setBottomMargin] =useState("0");
  const [errors, setErrors] = useState({
    batch: false,
    branch: false,
    company: false,
    role: false,
    markdown: false,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [previousMarkdown, setPreviousMarkdown] = useState("");
  const years = Array.from({ length: 28 }, (_, index) => 2000 + index);
  
  

  const handleIdeasClick = () => {
    // Store the current markdown before applying the template
    setPreviousMarkdown(markdown);

    // Create an undo stack entry
    if (editorRef.current) {
      const textArea = editorRef.current.querySelector('textarea');
      if (textArea) {
        const undoEvent = new InputEvent('input', {
          inputType: 'historyUndo',
          bubbles: true,
          cancelable: true,
        });
        textArea.dispatchEvent(undoEvent);
      }
    }

    setMarkdown(dummyText)};

    
    useEffect(() => {
      const fetchCompanies = async () => {
        try {
          const response = await fetch("/api/getCompanies");
      
          // Check if the response is OK before trying to parse JSON
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json();
      
          // Ensure the data is what you expect
          // console.log(data);
      
          if (data.success && Array.isArray(data.data)) {
            setCompanies(data.data);
          } else {
            console.error("Error: No companies found or invalid data format");
          }
        } catch (error) {
          console.error("Error fetching companies:", error);
        }
      };
      
      fetchCompanies();
    }, []);
    


  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && previousMarkdown) {
        setMarkdown(previousMarkdown);
        setPreviousMarkdown('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previousMarkdown]);

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

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setBottomMargin(window.innerWidth < 768 ? "80px" : "0");
      setHeight(window.innerWidth < 768 ? "calc(100vh - 50px)" : "calc(100vh)"); // Adjust height based on screen size
    };
  
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  

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

  useEffect(() => {
    if (session?.user?.email) {
      // Check if the markdown is equal to the dummy text, don't save if it is
      if (markdown !== dummyText) {
        saveDraft({
          exp_text: markdown,
          batch,
          branch,
          company,
          role,
        });
      }
    }
  }, [markdown, batch, branch, company, role, saveDraft, session?.user?.email]);
  

  // Validation function for specific fields
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'batch':
        return !value;
      case 'branch':
        return !value;
      case 'company':
        return !value;
      case 'role':
        return !value;
      case 'markdown':
        return !value.trim();
      default:
        return false;
    }
  };

  // Handle input changes and validate only the relevant field
  const handleBatchChange = (e) => {
    const value = e.target.value;
    setBatch(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      batch: validateField('batch', value),
    }));
  };

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setBranch(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      branch: validateField('branch', value),
    }));
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
    if (e.target.value !== "others") {
      setCustomCompany(""); // Reset custom company when a predefined one is selected
    }
  };
  
  const handleCustomCompanyChange = (e) => {
    setCustomCompany(e.target.value);
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;
    setRole(value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      role: validateField('role', value),
    }));
  };

  const handleMarkdownChange = (value) => {
    setMarkdown(value || "");
    setErrors((prevErrors) => ({
      ...prevErrors,
      markdown: validateField('markdown', value || ""),
    }));
  };

  const handleSubmit = async () => {
    
  
    if (!session) {
      alert("You need to be logged in to submit!");
      return;
    }
  
    // Validate all fields one last time before submitting
    const newErrors = {
      batch: validateField('batch', batch),
      branch: validateField('branch', branch),
      company: validateField('company', company),
      role: validateField('role', role),
      markdown: validateField('markdown', markdown),
    };
  
    setErrors(newErrors);
  
    if (Object.values(newErrors).includes(true)) {
      alert("Please fill in all required fields.");
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
  
      // After successful submission, reset the draft
      setBatch("");
      setBranch("");
      setCompany("");
      setRole("");
      setMarkdown("");
      setErrors({
        batch: false,
        branch: false,
        company: false,
        role: false,
        markdown: false,
      });
  
      // Delete the draft from the backend
      await fetch("/api/deleteDraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });
  
      // Show success message
      setSuccessMessage("Your experience has been successfully submitted!");
  
      // Redirect to home after 2 seconds (for smooth UX)
      setTimeout(() => {
        window.location.href = '/home';
      }, 2000);
      
  
    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
    }
  };
  
  

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {/* Warning message for small screens */}
      {isSmallScreen && (
        <div className="text-yellow-500 text-center py-4 mt-[100px]" >
          <p>For the best experience, please use a tablet or laptop.</p>
        </div>
      )}

      <div className="md:mt-[100px] sm:mt-[140px] lg:mt-[120px]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select
                value={batch}
                onChange={handleBatchChange}
                className={`w-full p-2 border ${
                  errors.batch ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.batch && (
                <p className="text-red-500 text-sm mt-1">Year is required</p>
              )}
            </div>

            <div className="relative">
              <select
                value={branch}
                onChange={handleBranchChange}
                className={`w-full p-2 border ${
                  errors.branch ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              >
                <option value="">Select Branch</option>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="EnTC">Electronics and Telecommunication</option>
                <option value="AIDS">Artificial Intelligence & Data Science</option>
                <option value="EC">Electronics and Computer</option>
              </select>
              {errors.branch && (
                <p className="text-red-500 text-sm mt-1">Branch is required</p>
              )}
            </div>

            <div className="relative">
  <select
    value={company}
    onChange={handleCompanyChange}
    className={`w-full p-2 border ${
      errors.company ? "border-red-500" : "border-gray-300"
    } rounded-lg`}
  >
    <option value="">Select Company</option>
    {companies.map((comp) => (
      <option key={comp} value={comp}>
        {comp}
      </option>
    ))}
    <option value="others">Others...</option>
  </select>

  {/* Input field for custom company name */}
  {company === "others" && (
    <input
      type="text"
      onChange={handleCustomCompanyChange}
      placeholder="Enter Company Name"
      value={customCompany}
      className={`w-full p-2 border ${
        errors.company ? "border-red-500" : "border-gray-300"
      } rounded-lg mt-2`}
    />
  )}

  {errors.company && (
    <p className="text-red-500 text-sm mt-1">Company is required</p>
  )}
</div>


            <div className="relative">
              <input
                type="text"
                value={role}
                onChange={handleRoleChange}
                placeholder="Enter Role (Eg: SDE)"
                className={`w-full p-2 border ${
                  errors.role ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              />
              {errors.role && (
                <p className="text-red-500 text-sm mt-1">Role is required</p>
              )}
            </div>
          </div>
          {successMessage && (
  <div className="bg-[#E7F3FF] text-[#1D1D1D] p-4 rounded-lg shadow-md mb-4 text-center">
    <div className="flex items-center justify-center">
      <svg className="w-6 h-6 text-[#00C853] mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M16.293 5.293a1 1 0 00-1.414 0L8 11.586 4.121 7.707a1 1 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clipRule="evenodd" />
      </svg>
      <p className="font-semibold text-lg text-[#1D1D1D]">{successMessage}</p>
    </div>
  </div>
)}


          <div className="rounded-lg overflow-hidden relative" style={{ height, marginBottom: bottomMargin }}>
  {/* Flexbox Container for Submit Button and Ideas Link */}
  <div className="flex justify-between items-center mb-3 px-3 py-1.5">
  {/* Submit Button */}
  <button
    onClick={handleSubmit}
    className="text-sm sm:text-md bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none py-1.5 px-3.5"
  >
    Submit
  </button>
  {/* Ideas Link */}
  <p
    onClick={handleIdeasClick}
    className="text-[#1877F2] cursor-pointer hover:underline text-sm"
  >
    Short on Ideas?
  </p>
</div>


  {/* Markdown Editor */}
  <MDEditor
    value={markdown}
    onChange={handleMarkdownChange}
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
