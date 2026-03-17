"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "../../../components/Navbar";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditPage() {
    const [successMessage, setSuccessMessage] = useState('');
    const [warningMessage, setWarningMessage] = useState(''); // New warning message state
  const { data: session } = useSession();
  const { id } = useParams();
  const [markdown, setMarkdown] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
   const [company, setCompany] = useState("");
   const [customCompany, setCustomCompany] = useState("");
   const [role, setRole] = useState("");
   const [customRole, setCustomRole] = useState("");
  const [height, setHeight] = useState("calc(100vh)");
  const [windowWidth, setWindowWidth] = useState(0);

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

  const years = Array.from({ length: 28 }, (_, index) => 2000 + index).reverse();
  const roles = ["Intern","SDE", "QA", "Data Scientist", "Product Manager", "UX/UI Designer", "Business Analyst", "DevOps Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "Cloud Architect", "Systems Engineer", "Full Stack Developer", "Front-End Developer", "Back-End Developer", "Database Administrator (DBA)", "Software Engineer in Test (SET)", "Solutions Architect", "Network Engineer", "Site Reliability Engineer (SRE)", "Security Engineer", "Data Analyst", "Product Designer", "AI Engineer", "BI Analyst", "Marketing Manager", "Sales Engineer", "Customer Success Manager", "Technical Support Specialist", "HR Manager", "Talent Acquisition Specialist", "Project Manager", "Content Strategist", "Technical Writer", "Digital Marketing Manager", "Community Manager", "Legal Counsel", "PR Specialist", "Customer Support Specialist", "Business Development Manager", "Finance Analyst", "Operations Manager", "Product Marketing Manager", "Scrum Master", "Game Developer", "Blockchain Developer"];
  const companies = ["ACA Group", "ACI Worldwide", "AGCO", "Accelva", "Accenture", "Acuiti Labs", "Adobe", "Agiliad Technologies", "Agiliad Technology", "Alpha Sense", "Altizon", "Altometa", "Amazon", "Amazon Pay", "Amdocs", "AngelList India", "Apple", "Arista Networks", "Aspect Ratio", "Atlan", "Avaya", "Avegen", "Ayaan & Symtronics", "Ayaan Autonomous", "BBD", "BMC Software", "BNY Mellon", "BYJU'S", "Bajaj Finserv", "Bakliwal Tutorials", "BambooHR", "BankBazaar", "Barclays", "Berkadia", "Birlasoft", "Bloomberg", "Brainstorm Force", "CLSA", "Cadence", "Capgemini", "CarDekho", "Cencora", "Chargebee", "Cisco", "Citrix", "Cloudlex", "Code Walla", "CodeChef", "Coforge", "Cognizant", "Corizo", "Cornerstone OnDemand", "Coursera", "Credit Suisse", "CrowdStrike", "CutShort", "Cutshort", "Cyient", "DataAxle (Pending)", "Datacaze", "Dataeze", "Datametica", "Dell", "Deloitte India", "DeltaX", "Deutsche Bank", "Dragonfly Financial Technologies", "Druva", "E2Open", "EQ Technologic", "ETraveli", "EXL", "Elastic Run", "Emerson", "Energy Exemplar", "Entrata", "Equifax", "Ericsson", "Espressif Systems", "Facctum IT Solutions", "Facebook (Meta)", "FinIQ", "Findability Sciences", "FireEye", "Firstsource Solutions", "Fiserv", "Flextrade", "Flipkart", "Flo Group", "Fold Health", "Foldhealth", "Fortinet", "Fox Solutions", "Freshworks", "GeeksforGeeks", "General Mills", "Godrej & Bovce", "Goldman Sachs", "Google", "Google Pay", "Great Learning", "HCL Technologies", "HDFC Bank", "HP", "HSBC", "HackerEarth", "HackerRank", "Happiest Minds Technologies", "Hexaware", "Hexaware Technologies", "HighRadius", "Hotstar", "Huawei", "IBM", "IDeaS", "ISS", "Icertis", "Ideas", "Imagination Technologies", "Incubyte", "Indeed India", "Infogen Labs", "Infosys", "Innoplexus", "Instagram", "Instahyre", "Intangles Lab", "Intel", "InterviewBit", "Ion", "Ittiam", "Ittiam Systems", "JM Finance", "JPMC", "Juniper Networks", "Kissflow", "Kylas", "LG", "LTI Spark", "Larsen & Toubro Infotech (LTI)", "Launch Ventures", "LeetCode", "LinkedIn", "LinkedIn India", "Lowe's India", "MX Player", "ManageEngine", "Masai School", "Mastercard", "McAfee", "Media.net", "Merilytics", "Metro GSC", "Microsoft", "Miko", "Mindstix", "Mindtree", "Mini Orange", "Moglix", "Monster India", "Mphasis", "Myntra", "NCS", "NICE Inc.", "NTT Business Solutions (SAP)", "Naukri.com", "Neilsoft", "Netflix", "Newton School", "Nice Systems", "Nihilent", "Nokia", "Northern Trust", "Nvidia", "OfBusiness", "Okta", "Ola", "Oracle", "Ordway Labs", "PWC", "Palo Alto", "Palo Alto Networks", "Paypal", "Paytm", "Persistent", "Persistent Systems", "PhonePe", "Ping Identity", "Policybazaar", "Principal Global Services", "Principal Global Solutions", "Promobi Technology", "PubMatic India", "Pubmatic", "Qualcomm", "Qualys", "Quantiphi Analytics", "Quick Heal", "Quorum Softwares", "RBL Bank", "RIA Advisory LLP", "Ramco Systems", "Red Hat", "Relevel", "Rinex", "Rockwell Automation", "Route Mobile", "Rubriks", "Ryussi Technologies", "SAP", "Sagitec", "SailPoint", "Salesforce", "Samsung", "Samsung Semiconductor India Research", "Sasken", "Sasken Technologies", "Scaler", "Schlumberger", "Searce", "Sell.Do (Beyondwalls)", "ServiceNow", "Shine.com", "Siemens", "Siemens Regular", "Simplilearn", "Snapchat", "Sonata Software", "Sony", "SonyLIV", "Source.One", "Spotify", "Stellaris", "SumTotal Systems", "Suzlon", "Symantec", "TCS Digital", "TCS Ninja", "TCS Prime", "TCS R&1", "TCS R&D", "TIAA India", "Tally Solutions", "Tata Consultancy Services (TCS)", "Tech Mahindra", "Tech Verito", "Tiaa India", "TimesJobs", "Toshiba", "Tracelink", "Trading Technologies", "Trend Micro", "Trilogy Innovations", "Turing", "Turtlemint", "Twitter (X)", "UBS", "UPTIQ", "Uber", "Udemy", "Ugam", "Unacademy", "UpGrad", "UptiQ", "VMware", "Vedantu", "Veras Retail", "Veritas", "Veritas India", "Vertical Fox", "Vertiv", "Visteon", "WhatsApp", "Wipro", "WisdmLabs", "Wissen Technology", "Workday", "Yardi", "YouTube", "ZS Associates", "ZTE", "Zee5", "Zensar", "Zensar Technologies", "Zinrelo", "Zoho", "e-Emphasys", "e2open", "eClerx Services", "eQ Technologies", "edX"];


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

  // Determine the company and role to send to the API
  const finalCompany = company === 'others' ? customCompany : company;
  const finalRole = role === 'others' ? customRole : role;

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
        company: finalCompany, // Use finalCompany here
        role: finalRole,       // Use finalRole here
        email,
      }),
    });

    const data = await response.json();

    // Check both response.ok and data for error messages
    if (!response.ok) {
      throw new Error(data.message || "Failed to edit experience");
    }

    // After successful submission, reset form
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

    setWarningMessage("Changes may take a few minutes to appear.");
    setSuccessMessage("Your experience has been successfully updated!");
     // Set warning message

    setTimeout(() => {
      window.location.href = `/single/${data.uid}`;
    }, 3000); // Redirect after 3 seconds, adjust time as needed

  } catch (error) {
    console.error("Error updating experience:", error);
    alert(error.message || "There was an error updating your experience.");
  }
};


  return (
    <div className="flex min-h-screen flex-col bg-background-light text-slate-900 dark:bg-background-dark dark:text-slate-100 mb-[90vh] sm:mb-[10vh] md:mb-[40vh]">
      <Navbar />

      {isSmallScreen && (
      <div className="text-slate-500 dark:text-slate-400 text-center py-4 mt-[100px]">
        <i className="fa fa-exclamation-circle text-red-500 mr-2">Small screen detected</i>
        <p>For the best experience, please use a tablet or laptop.</p>
      </div>
    )}

      <div className="md:mt-[100px] sm:mt-[140px] lg:mt-[120px]">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="text-center text-slate-500 dark:text-slate-400 text-sm mb-4">
      <p>Pro Tip: Maximize the editor for a better experience!</p>
    </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select
                value={batch}
                onChange={(e) => handleFieldChange("batch", e.target.value)}
                className={`w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
                  errors.batch ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                }`}
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
                className={`w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
                  errors.branch ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                }`}
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
    className={`w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
      errors.company ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    }`}
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
      className={`mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
        errors.company ? "border-red-500" : "border-slate-300 dark:border-slate-700"
      }`}
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
    className={`w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
      errors.role ? "border-red-500" : "border-slate-300 dark:border-slate-700"
    }`}
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
      className={`mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900 dark:text-slate-100 ${
        errors.role ? "border-red-500" : "border-slate-300 dark:border-slate-700"
      }`}
    />
  )}

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
{warningMessage && (
  <div className="bg-amber-500/15 text-amber-300 p-4 rounded-lg border border-amber-500/30 shadow-md mb-4 text-center">
    <div className="flex items-center justify-center">
      <svg className="w-6 h-6 text-[#FFC107] mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      <p className="font-semibold text-md text-amber-200">{warningMessage}</p>
    </div>
  </div>
)}


          {/* Editor Container with fixed height */}
<div
  className="rounded-lg overflow-hidden relative"
  style={{
    height,
    marginBottom: bottomMargin,
    minHeight: '100%',
  }}
>

          {/* Submit Button at the top */}
          <div className="absolute top-4 w-full px-3 py-1.5 flex justify-center">
          <button
  onClick={handleSubmit}
  type="button"
  className="text-sm sm:text-md bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-200 focus:ring-4 focus:ring-primary/30 focus:outline-none py-2 px-16 z-50"
>
  Submit
</button>


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
  <div className="mb-[800px]"></div>
</div>
        </div>

        </div>
      </div>
    </div>
  );
}
