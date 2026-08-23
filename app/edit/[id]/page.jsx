"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";
import ExperienceTiptapEditor from "../../../components/ExperienceTiptapEditor";
import postCompanies from "@/data/post-companies.json";
import { requestJson } from "@/lib/client-api";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";

const getEditorPlainText = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function EditPage() {
    const [successMessage, setSuccessMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState(''); // New warning message state
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const redirectTimer = useRef(null);
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
   const [company, setCompany] = useState("");
   const [customCompany, setCustomCompany] = useState("");
   const [role, setRole] = useState("");
   const [customRole, setCustomRole] = useState("");
  const [height, setHeight] = useState("calc(100vh)");
  const [bottomMargin, setBottomMargin] = useState("0");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    batch: false,
    branch: false,
    company: false,
    role: false,
    markdown: false,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Cancel the post-save redirect if the user navigates away first.
  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const years = Array.from({ length: 28 }, (_, index) => 2000 + index).reverse();
  const roles = ["Intern","SDE", "QA", "Data Scientist", "Product Manager", "UX/UI Designer", "Business Analyst", "DevOps Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "Cloud Architect", "Systems Engineer", "Full Stack Developer", "Front-End Developer", "Back-End Developer", "Database Administrator (DBA)", "Software Engineer in Test (SET)", "Solutions Architect", "Network Engineer", "Site Reliability Engineer (SRE)", "Security Engineer", "Data Analyst", "Product Designer", "AI Engineer", "BI Analyst", "Marketing Manager", "Sales Engineer", "Customer Success Manager", "Technical Support Specialist", "HR Manager", "Talent Acquisition Specialist", "Project Manager", "Content Strategist", "Technical Writer", "Digital Marketing Manager", "Community Manager", "Legal Counsel", "PR Specialist", "Customer Support Specialist", "Business Development Manager", "Finance Analyst", "Operations Manager", "Product Marketing Manager", "Scrum Master", "Game Developer", "Blockchain Developer"];
  const companies = postCompanies;

  // A post saved with a custom company/role has no matching <option>, so the
  // select rendered blank while state still held the value -- it looked like a
  // required field the user had never filled in.
  const withCurrent = (options, current) =>
    current && current !== "others" && !options.includes(current) ? [current, ...options] : options;


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 768);
        setBottomMargin(window.innerWidth < 768 ? "80px" : "0px");
        setHeight(window.innerWidth < 768 ? "calc(100vh - 50px)" : "calc(100vh)"); // Adjust height based on screen size
      };

      handleResize(); // Set initial state on mount
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);




  useEffect(() => {
    if (!id) return undefined;

    const controller = new AbortController();

    (async () => {
      setLoadError("");
      setIsLoaded(false);
      try {
        const response = await fetch(`/api/exp?uid=${id}`, { signal: controller.signal });
        const data = await requestJson(response, {}, {});
        // Fall back to "" rather than undefined: a controlled input handed
        // undefined flips to uncontrolled and drops what the user types.
        setMarkdown(data?.exp_text || "");
        setBatch(data?.batch || "");
        setBranch(data?.branch || "");
        setCompany(data?.company || "");
        setRole(data?.role || "");
        setIsLoaded(true);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Error fetching experience data:", error);
        setLoadError("Could not load this experience. Refresh to try again.");
      }
    })();

    return () => controller.abort();
  }, [id]);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'batch':
        return !value;
      case 'branch':
        return !value;
      case 'company':
        return !value || (value === 'others' && !customCompany); // Checks if company is empty or "others" without custom name
      case 'role':
        return !value || (value === 'others' && !customRole); // Checks if role is empty or "Others" without custom role
      case 'markdown':
        return !getEditorPlainText(value);
      default:
        return false;
    }
  };

  const handleCompanyChange = (e) => {
    setCompany(e.target.value);
    if (e.target.value !== "others") {
      setCustomCompany(""); // Reset custom company when a predefined one is selected
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      company: validateField('company', e.target.value),
    }));
  };

  const handleCustomCompanyChange = (e) => {
    setCustomCompany(e.target.value);
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (e.target.value !== "others") {
      setCustomRole(""); // Reset custom role when a predefined one is selected
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      role: validateField('role', e.target.value),
    }));
  };

  const handleCustomRoleChange = (e) => {
    setCustomRole(e.target.value); // Update custom role state when user types in the input field
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

 // Frontend handleSubmit function
const handleSubmit = async () => {
  if (isSubmitting) return;

  if (!session) {
    setFormError("You need to be signed in to save changes.");
    return;
  }

  // Submitting before the existing post has loaded would overwrite it with blanks.
  if (!isLoaded) {
    setFormError("Still loading this experience. Please wait a moment.");
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
    setFormError("Please fill in all required fields.");
    return;
  }

  setFormError("");
  setIsSubmitting(true);

  // Determine the company and role to send to the API
  const finalCompany = company === 'others' ? customCompany : company;
  const finalRole = role === 'others' ? customRole : role;

  try {
    const response = await fetch("/api/edit/", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      // The author is taken from the session server-side; sending an email here
      // was the IDOR that let anyone rewrite anyone's post.
      body: JSON.stringify({
        uid: id,
        exp_text: markdown,
        batch,
        branch,
        company: finalCompany,
        role: finalRole,
      }),
    });

    const data = await requestJson(response, {}, {});

    // Check both response.ok and data for error messages
    if (!response.ok) {
      throw new Error(data.message || "Failed to edit experience");
    }

    // The form used to be blanked here while navigation was deferred 2s, so for
    // two seconds the user saw an empty form with a live Submit button; pressing
    // it replaced the success banner with "Please fill in all required fields".
    // Keep the values, keep the form disabled, then navigate.
    setErrors({
      batch: false,
      branch: false,
      company: false,
      role: false,
      markdown: false,
    });

    setWarningMessage("Changes may take a few minutes to appear.");
    setSuccessMessage("Your experience has been successfully updated!");

    // data.uid can be missing; falling back to `id` avoids /single/undefined.
    redirectTimer.current = setTimeout(() => {
      router.push(`/single/${data?.uid || id}`);
    }, 1200);
    return;
  } catch (error) {
    console.error("Error updating experience:", error);
    setFormError(error.message || "There was an error updating your experience.");
    setIsSubmitting(false);
  }
};


  return (
    <div className="flex h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 mb-[90vh] sm:mb-[10vh] md:mb-[40vh]">
      <Navbar />

      {isSmallScreen && (
      <div className="mt-[100px] py-4 text-center text-slate-500 dark:text-slate-400">
        <i className="fa fa-exclamation-circle text-red-500 mr-2">Small screen detected</i>
        <p>For the best experience, please use a tablet or laptop.</p>
      </div>
    )}

      <div className="md:mt-[100px] sm:mt-[140px] lg:mt-[120px]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>Pro Tip: Maximize the editor for a better experience!</p>
    </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select
                value={batch}
                onChange={(e) => handleFieldChange("batch", e.target.value)}
                className={`w-full p-2 border ${
                  errors.batch ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                } rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
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
                  errors.branch ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                } rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
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
      errors.company ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    } rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
  >
    <option value="">Select Company</option>
    <option value="others">Others...</option>
    {withCurrent(companies, company).map((comp) => (
      <option key={comp} value={comp}>
        {comp}
      </option>
    ))}
  </select>

  {/* Input field for custom company name */}
  {company === "others" && (
    <input
      type="text"
      onChange={handleCustomCompanyChange}
      placeholder="Enter Company Name"
      value={customCompany}
      className={`w-full p-2 border ${
        errors.company ? "border-red-500" : "border-slate-300 dark:border-slate-700"
      } rounded-lg mt-2`}
    />
  )}

  {errors.company && (
    <p className="text-red-500 text-sm mt-1">Company is required</p>
  )}
</div>

<div className="relative">
  <select
    value={role}
    onChange={handleRoleChange}
    className={`w-full p-2 border ${
      errors.role ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    } rounded-lg bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
  >
    <option value="">Select Role</option>
    <option value="others">Others...</option>
    {withCurrent(roles, role).map((roleOption) => (
      <option key={roleOption} value={roleOption}>
        {roleOption}
      </option>
    ))}


  </select>

  {/* Input field for custom role name */}
  {role === "others" && (
    <input
      type="text"
      onChange={handleCustomRoleChange}
      placeholder="Enter Role"
      value={customRole}
      className={`w-full p-2 border ${
        errors.role ? "border-red-500" : "border-slate-300 dark:border-slate-700"
      } rounded-lg mt-2`}
    />
  )}

  {errors.role && (
    <p className="text-red-500 text-sm mt-1">Role is required</p>
  )}
</div>
          </div>
          <div className="mb-4 space-y-2">
            <Alert tone="error">{loadError}</Alert>
            <Alert tone="error">{formError}</Alert>
            <Alert tone="success">{successMessage}</Alert>
            <Alert tone="info">{warningMessage}</Alert>
          </div>

          {/* Editor Container with fixed height */}
        <div
  className="rounded-lg overflow-hidden relative"
  // Use the state computed in the resize effect. Reading window.innerWidth here
  // ran during render on a server-rendered client page and threw
  // "window is not defined".
  style={{
    height,
    marginBottom: bottomMargin,
    minHeight: '100%',
  }}
>

          {/* Submit Button at the top */}
          <div className="absolute top-4 w-full px-3 py-1.5 flex justify-center">
          <Button
  onClick={handleSubmit}
  type="button"
  loading={isSubmitting}
  size="lg"
  className="z-50 px-16"
>
  {isSubmitting ? "Saving..." : "Submit"}
</Button>


</div>

          {/* Markdown Editor with Scrollable Content */}
          <div className="relative w-full h-full pt-16 overflow-hidden">
  {/* The padding-top `pt-16` ensures that the content does not overlap with the button */}
  <div className="w-full h-full overflow-y-auto">
    <ExperienceTiptapEditor
      value={markdown}
      onChange={handleMarkdownChange}
      minHeight={700}
    />
  </div>
  <div className="mb-[800px]"></div>
</div>
        </div>

        </div>
      </div>
    </div>
  );
}
