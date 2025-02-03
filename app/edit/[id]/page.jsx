"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditPage() {
  const { data: session } = useSession();
  const { id } = useParams();
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [height, setHeight] = useState("calc(100vh)");
  const [bottomMargin, setBottomMargin] = useState("0");
  const [errors, setErrors] = useState({
    batch: false,
    branch: false,
    company: false,
    role: false,
    markdown: false,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [expData, setExpData] = useState(null);

  const years = Array.from({ length: 28 }, (_, index) => 2000 + index);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
      setBottomMargin(window.innerWidth < 768 ? "200px" : "0px");
      setHeight(window.innerWidth < 768 ? "calc(50vh - 50px)" : "calc(73vh)");
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchExperienceData = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/exp?uid=${id}`);
      if (!response.ok) throw new Error("Failed to fetch data");
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

  useEffect(() => {
    if (id) fetchExperienceData();
  }, [id]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case "batch":
        return !value;
      case "branch":
        return !value;
      case "company":
        return !value;
      case "role":
        return !value;
      case "markdown":
        return !value.trim();
      default:
        return false;
    }
  };

  const handleFieldChange = (fieldName, value) => {
    switch (fieldName) {
      case "batch":
        setBatch(value);
        break;
      case "branch":
        setBranch(value);
        break;
      case "company":
        setCompany(value);
        break;
      case "role":
        setRole(value);
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const handleMarkdownChange = (value) => {
    setMarkdown(value || "");
    setErrors((prevErrors) => ({
      ...prevErrors,
      markdown: validateField("markdown", value || ""),
    }));
  };

  const handleSubmit = async () => {
    if (!session) {
      alert("You need to be logged in to submit!");
      return;
    }

    const newErrors = {
      batch: validateField("batch", batch),
      branch: validateField("branch", branch),
      company: validateField("company", company),
      role: validateField("role", role),
      markdown: validateField("markdown", markdown),
    };

    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const email = session?.user?.email || "Unknown";
      const name = session?.user?.name || "Anonymous";
      const profile_pic = session?.user?.image || "";
      const response = await fetch("/api/edit/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

      if (!response.ok) throw new Error("Failed to submit markdown");
      alert("Markdown submitted successfully!");
    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      {isSmallScreen && (
        <div className="text-yellow-500 text-center py-4 mt-[100px]">
          <p>For the best experience, please use a tablet or laptop.</p>
        </div>
      )}

      <div className="md:mt-[100px] sm:mt-[140px] lg:mt-[120px]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select
                value={batch}
                onChange={(e) => handleFieldChange("batch", e.target.value)}
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
                onChange={(e) => handleFieldChange("branch", e.target.value)}
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
                onChange={(e) => handleFieldChange("company", e.target.value)}
                className={`w-full p-2 border ${
                  errors.company ? "border-red-500" : "border-gray-300"
                } rounded-lg`}
              >
                <option value="">Select Company</option>
                <option value="Barclays">Barclays</option>
                <option value="Google">Google</option>
                <option value="Microsoft">Microsoft</option>
              </select>
              {errors.company && (
                <p className="text-red-500 text-sm mt-1">Company is required</p>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
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

          <div className="rounded-lg overflow-hidden relative" style={{ height, marginBottom: bottomMargin }}>
            <button
              onClick={handleSubmit}
              className="relative top-0 right-0 mb-3 px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none z-10"
            >
              Submit
            </button>

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