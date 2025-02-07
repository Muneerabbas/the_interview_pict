"use client";
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import debounce from "lodash/debounce";
import 'font-awesome/css/font-awesome.min.css';
import Link from "next/link";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const LoadingScreen = () => (
  <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-500 bg-opacity-50 z-50">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);


export default function MdxEditorPage() {
  const [successMessage, setSuccessMessage] = useState('');
  const { data: session } = useSession();
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
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
  const years = Array.from({ length: 28 }, (_, index) => 2000 + index).reverse();
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["Intern","SDE", "QA", "Data Scientist", "Product Manager", "UX/UI Designer", "Business Analyst", "DevOps Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "Cloud Architect", "Systems Engineer", "Full Stack Developer", "Front-End Developer", "Back-End Developer", "Database Administrator (DBA)", "Software Engineer in Test (SET)", "Solutions Architect", "Network Engineer", "Site Reliability Engineer (SRE)", "Security Engineer", "Data Analyst", "Product Designer", "AI Engineer", "BI Analyst", "Marketing Manager", "Sales Engineer", "Customer Success Manager", "Technical Support Specialist", "HR Manager", "Talent Acquisition Specialist", "Project Manager", "Content Strategist", "Technical Writer", "Digital Marketing Manager", "Community Manager", "Legal Counsel", "PR Specialist", "Customer Support Specialist", "Business Development Manager", "Finance Analyst", "Operations Manager", "Product Marketing Manager", "Scrum Master", "Game Developer", "Blockchain Developer"];
  const companies = ["ACA Group", "ACI Worldwide", "AGCO", "Accelva", "Accenture", "Acuiti Labs", "Adobe", "Agiliad Technologies", "Agiliad Technology", "Alpha Sense", "Altizon", "Altometa", "Amazon", "Amazon Pay", "Amdocs", "AngelList India", "Apple", "Arista Networks", "Aspect Ratio", "Atlan", "Avaya", "Avegen", "Ayaan & Symtronics", "Ayaan Autonomous", "BBD", "BMC Software", "BNY Mellon", "BYJU'S", "Bajaj Finserv", "Bakliwal Tutorials", "BambooHR", "BankBazaar", "Barclays", "Berkadia", "Birlasoft", "Bloomberg", "Brainstorm Force", "CLSA", "Cadence", "Capgemini", "CarDekho", "Cencora", "Chargebee", "Cisco", "Citrix", "Cloudlex", "Code Walla", "CodeChef", "Coforge", "Cognizant", "Corizo", "Cornerstone OnDemand", "Coursera", "Credit Suisse", "CrowdStrike", "CutShort", "Cutshort", "Cyient", "DataAxle (Pending)", "Datacaze", "Dataeze", "Datametica", "Dell", "Deloitte India", "DeltaX", "Deutsche Bank", "Dragonfly Financial Technologies", "Druva", "E2Open", "EQ Technologic", "ETraveli", "EXL", "Elastic Run", "Emerson", "Energy Exemplar", "Entrata", "Equifax", "Ericsson", "Espressif Systems", "Facctum IT Solutions", "Facebook (Meta)", "FinIQ", "Findability Sciences", "FireEye", "Firstsource Solutions", "Fiserv", "Flextrade", "Flipkart", "Flo Group", "Fold Health", "Foldhealth", "Fortinet", "Fox Solutions", "Freshworks", "GeeksforGeeks", "General Mills", "Godrej & Bovce", "Goldman Sachs", "Google", "Google Pay", "Great Learning", "HCL Technologies", "HDFC Bank", "HP", "HSBC", "HackerEarth", "HackerRank", "Happiest Minds Technologies", "Hexaware", "Hexaware Technologies", "HighRadius", "Hotstar", "Huawei", "IBM", "IDeaS", "ISS", "Icertis", "Ideas", "Imagination Technologies", "Incubyte", "Indeed India", "Infogen Labs", "Infosys", "Innoplexus", "Instagram", "Instahyre", "Intangles Lab", "Intel", "InterviewBit", "Ion", "Ittiam", "Ittiam Systems", "JM Finance", "JPMC", "Juniper Networks", "Kissflow", "Kylas", "LG", "LTI Spark", "Larsen & Toubro Infotech (LTI)", "Launch Ventures", "LeetCode", "LinkedIn", "LinkedIn India", "Lowe's India", "MX Player", "ManageEngine", "Masai School", "Mastercard", "McAfee", "Media.net", "Merilytics", "Metro GSC", "Microsoft", "Miko", "Mindstix", "Mindtree", "Mini Orange", "Moglix", "Monster India", "Mphasis", "Myntra", "NCS", "NICE Inc.", "NTT Business Solutions (SAP)", "Naukri.com", "Neilsoft", "Netflix", "Newton School", "Nice Systems", "Nihilent", "Nokia", "Northern Trust", "Nvidia", "OfBusiness", "Okta", "Ola", "Oracle", "Ordway Labs", "PWC", "Palo Alto", "Palo Alto Networks", "Paypal", "Paytm", "Persistent", "Persistent Systems", "PhonePe", "Ping Identity", "Policybazaar", "Principal Global Services", "Principal Global Solutions", "Promobi Technology", "PubMatic India", "Pubmatic", "Qualcomm", "Qualys", "Quantiphi Analytics", "Quick Heal", "Quorum Softwares", "RBL Bank", "RIA Advisory LLP", "Ramco Systems", "Red Hat", "Relevel", "Rinex", "Rockwell Automation", "Route Mobile", "Rubriks", "Ryussi Technologies", "SAP", "Sagitec", "SailPoint", "Salesforce", "Samsung", "Samsung Semiconductor India Research", "Sasken", "Sasken Technologies", "Scaler", "Schlumberger", "Searce", "Sell.Do (Beyondwalls)", "ServiceNow", "Shine.com", "Siemens", "Siemens Regular", "Simplilearn", "Snapchat", "Sonata Software", "Sony", "SonyLIV", "Source.One", "Spotify", "Stellaris", "SumTotal Systems", "Suzlon", "Symantec", "TCS Digital", "TCS Ninja", "TCS Prime", "TCS R&1", "TCS R&D", "TIAA India", "Tally Solutions", "Tata Consultancy Services (TCS)", "Tech Mahindra", "Tech Verito", "Tiaa India", "TimesJobs", "Toshiba", "Tracelink", "Trading Technologies", "Trend Micro", "Trilogy Innovations", "Turing", "Turtlemint", "Twitter (X)", "UBS", "UPTIQ", "Uber", "Udemy", "Ugam", "Unacademy", "UpGrad", "UptiQ", "VMware", "Vedantu", "Veras Retail", "Veritas", "Veritas India", "Vertical Fox", "Vertiv", "Visteon", "WhatsApp", "Wipro", "WisdmLabs", "Wissen Technology", "Workday", "Yardi", "YouTube", "ZS Associates", "ZTE", "Zee5", "Zensar", "Zensar Technologies", "Zinrelo", "Zoho", "e-Emphasys", "e2open", "eClerx Services", "eQ Technologies", "edX"];


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



  // Validation function for specific fields
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

    // Determine the company and role to send to the API (use custom values if "Others..." is selected)
    const finalCompany = company === 'others' ? customCompany : company;
    const finalRole = role === 'others' ? customRole : role;

    setIsLoading(true); // Set loading to true before submission

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
          company: finalCompany, // Use final company value
          role: finalRole, // Use final role value
          email: session.user.email,
        }),
      });

      const data = await response.json();
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
      // Loading will be true until new page loads and this component unmounts
      window.location.href = `/single/${data.uid}`;


    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
      setIsLoading(false); // Stop loading in case of error
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      // Check if the markdown is equal to the dummy text, don't save if it is

        saveDraft({
          exp_text: markdown,
          batch,
          branch,
          company,
          role,
        });

    }
  }, [markdown, batch, branch, company, role, saveDraft, session?.user?.email]);


  const handleHelpClick = () => {
    setIsLoading(true);
    // No need to setIsLoading(false) here because page navigation will unmount the component
  };


  return (
    <div className="flex flex-col h-screen">
    <Navbar />
    {isLoading && <LoadingScreen />}

    {/* Warning message for small screens */}
    {isSmallScreen && (
      <div className=" text-gray-500 text-center py-4 mt-[100px]">
        <i className="fa fa-exclamation-circle text-red-500 mr-2">Small screen detected</i>
        <p>For the best experience, please use a tablet or laptop.</p>
      </div>
    )}

    <div className="md:mt-[100px] sm:mt-[140px] lg:mt-[120px]">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="text-center text-gray-500 text-sm mb-4">
      <p>Pro Tip: Maximize the editor for a better experience!</p>
    </div>
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
    <option value="others">Others...</option>
    {companies.map((comp) => (
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
        errors.company ? "border-red-500" : "border-gray-300"
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
      errors.role ? "border-red-500" : "border-gray-300"
    } rounded-lg`}
  >
    <option value="">Select Role</option>
    <option value="others">Others...</option>
    {roles.map((roleOption) => (
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
        errors.role ? "border-red-500" : "border-gray-300"
      } rounded-lg mt-2`}
    />
  )}

  {errors.role && (
    <p className="text-red-500 text-sm mt-1">Role is required</p>
  )}
</div>
        </div>

        {/* Success message */}
        {successMessage && (
          <div className="bg-[#E7F3FF] text-[#1D1D1D] p-4 rounded-lg shadow-md mb-4 text-center">
            <div className="flex items-center justify-center">
              <svg
                className="w-6 h-6 text-[#00C853] mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.293 5.293a1 1 0 00-1.414 0L8 11.586 4.121 7.707a1 1 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414 0l7-7a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold text-lg text-[#1D1D1D]">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Editor Container with fixed height */}
        <div
  className="rounded-lg overflow-hidden relative"
  style={{
    height:
      window.innerWidth < 768
        ? 'calc(75vh)'  // For mobile
        : window.innerWidth < 1024
        ? 'calc(100vh - 50px)'   // For tablet
        : 'calc(100vh)',         // For laptop and larger screens
    marginBottom: bottomMargin,
  }}
>

          {/* Submit Button at the top */}
          <div className="absolute top-4 w-full py-1.5 flex justify-between items-center">
          <button
  onClick={handleSubmit}
  type="button"
  className="text-sm sm:text-md bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none py-2 px-8 sm:px-16 z-50"
>
  Submit
</button>

<Link href="/help" onClick={handleHelpClick} className="text-blue-500 -mb-4 hover:text-blue-700 transition-colors duration-200 z-50 text-sm sm:text-base">Short on ideas?</Link>


</div>

          {/* Markdown Editor with Scrollable Content */}
          <div className="relative w-full h-full pt-16 overflow-hidden">
  {/* The padding-top `pt-16` ensures that the content does not overlap with the button */}
  <div className="w-full h-full overflow-y-auto">
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
    </div>
  </div>

  );
}