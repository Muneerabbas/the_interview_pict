"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const [height, setHeight] = useState("100vh");
  const [bottomMargin, setBottomMargin] = useState("0");
  const [errors, setErrors] = useState({
    batch: false,
    branch: false,
    company: false,
    role: false,
    markdown: false,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [previousMarkdown, setPreviousMarkdown] = useState("");
  const [mode, setMode] = useState("manual");

  const initialMessage = "Hi! I'll help you write your interview experience. First, what were the shortlisting criteria? (e.g., CGPA cutoff, Resume screening, Direct OA)";

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: initialMessage }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatStage, setChatStage] = useState('shortlisting'); // shortlisting -> rounds_count -> round_loop -> verdict -> generating -> done
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [chatAnswers, setChatAnswers] = useState({
    shortlisting: "", roundsText: "", roundDetails: [], verdictAndTips: ""
  });
  const chatContainerRef = useRef(null);

  const years = Array.from({ length: 28 }, (_, index) => 2000 + index).reverse();
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["Intern", "SDE", "QA", "Data Scientist", "Product Manager", "UX/UI Designer", "Business Analyst", "DevOps Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "Cloud Architect", "Systems Engineer", "Full Stack Developer", "Front-End Developer", "Back-End Developer", "Database Administrator (DBA)", "Software Engineer in Test (SET)", "Solutions Architect", "Network Engineer", "Site Reliability Engineer (SRE)", "Security Engineer", "Data Analyst", "Product Designer", "AI Engineer", "BI Analyst", "Marketing Manager", "Sales Engineer", "Customer Success Manager", "Technical Support Specialist", "HR Manager", "Talent Acquisition Specialist", "Project Manager", "Content Strategist", "Technical Writer", "Digital Marketing Manager", "Community Manager", "Legal Counsel", "PR Specialist", "Customer Support Specialist", "Business Development Manager", "Finance Analyst", "Operations Manager", "Product Marketing Manager", "Scrum Master", "Game Developer", "Blockchain Developer"];
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

  const validateRequiredMetaForAI = () => {
    const requiredErrors = {
      batch: validateField('batch', batch),
      branch: validateField('branch', branch),
      company: validateField('company', company),
      role: validateField('role', role),
    };

    setErrors((prevErrors) => ({
      ...prevErrors,
      ...requiredErrors,
    }));

    return !Object.values(requiredErrors).includes(true);
  };

  const handleModeChange = (nextMode) => {
    if (nextMode === 'ai' && !validateRequiredMetaForAI()) {
      alert("Please select Batch, Department, Company, and Role before using AI.");
      return;
    }
    setMode(nextMode);
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

  const handleClearForm = () => {
    setBatch("");
    setBranch("");
    setCompany("");
    setCustomCompany("");
    setRole("");
    setCustomRole("");
    setMarkdown("");
    setChatInput("");
    setErrors({
      batch: false,
      branch: false,
      company: false,
      role: false,
      markdown: false,
    });
    setMode("manual");
    setSuccessMessage("");
    setIsGenerating(false);
    setChatStage('shortlisting');
    setTotalRounds(0);
    setCurrentRound(1);
    setChatAnswers({ shortlisting: "", roundsText: "", roundDetails: [], verdictAndTips: "" });
    setChatMessages([{ role: 'assistant', text: initialMessage }]);
  };

  // Use explicit scroll on the container to prevent global window jumps
  useEffect(() => {
    if (mode === 'ai' && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages, isGenerating, mode]);

  const generateFromAPI = async (finalAnswers) => {
    setIsGenerating(true);
    try {
      const roundsList = finalAnswers.roundDetails.join("\n\n");
      const finalPayload = {
         company: company === 'others' ? customCompany : company || "Not specified",
         role: role === 'others' ? customRole : role || "Not specified",
         batch: batch || "Not specified",
         branch: branch || "Not specified",
         shortlisting: finalAnswers.shortlisting,
         rounds: finalAnswers.roundsText,
         topics: roundsList, // Condensed from the round loop
         verdictAndTips: finalAnswers.verdictAndTips
      };
      
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: finalPayload }),
      });

      const result = await res.json();
      if (result.text) {
        setMarkdown(result.text);
      } else {
        throw new Error("No text returned from API");
      }
    } catch (error) {
       console.error("Error generating from API:", error);
       setMarkdown("## Error generating markdown. Please try again or switch to manual.");
    } finally {
       setIsGenerating(false);
       setTimeout(() => {
          setMode('manual');
          // Reset chat completely for next time
          setChatStage('shortlisting');
          setTotalRounds(0);
          setCurrentRound(1);
          setChatAnswers({ shortlisting: "", roundsText: "", roundDetails: [], verdictAndTips: "" });
          setChatMessages([{ role: 'assistant', text: initialMessage }]);
       }, 2000);
    }
  };

  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating || chatStage === 'generating' || chatStage === 'done') return;

    const userMsg = chatInput.trim();
    const newMessages = [...chatMessages, { role: 'user', text: userMsg }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsGenerating(true); // Gives a nice "typing" gap before assistant responds

    setTimeout(() => {
      let nextAssistantMsg = "";
      let newStage = chatStage;
      let newAnswers = { ...chatAnswers };

      if (chatStage === 'shortlisting') {
         newAnswers.shortlisting = userMsg;
         newStage = 'rounds_count';
         nextAssistantMsg = "Got it! And how many interview rounds were there in total? (e.g. 3)";
      } 
      else if (chatStage === 'rounds_count') {
         newAnswers.roundsText = userMsg;
         // Parse how many rounds out of their answer string
         const match = userMsg.match(/\d+/);
         const num = match ? parseInt(match[0], 10) : 1;
         const clampedNum = Math.min(Math.max(num, 1), 10); // cap max rounds at 10
         setTotalRounds(clampedNum);
         setCurrentRound(1);
         newStage = 'round_loop';
         nextAssistantMsg = `Alright, ${clampedNum} round(s) it is. Let's break down Round 1. What type of round was it (e.g. OA, Technical, HR) and what were the main questions or tasks?`;
      }
      else if (chatStage === 'round_loop') {
         newAnswers.roundDetails = [...newAnswers.roundDetails, `Round ${currentRound}: ${userMsg}`];
         
         if (currentRound < totalRounds) {
            const nextRound = currentRound + 1;
            setCurrentRound(nextRound);
            nextAssistantMsg = `Awesome. Now for Round ${nextRound}, what type of round was it and what did they ask?`;
         } else {
            newStage = 'verdict';
            nextAssistantMsg = "Thanks for mapping out the rounds! Finally, what was the final verdict (e.g. Selected, Rejected) and do you have any tips for others?";
         }
      }
      else if (chatStage === 'verdict') {
         newAnswers.verdictAndTips = userMsg;
         newStage = 'generating';
         nextAssistantMsg = "All done! Give me a second while I format your experience perfectly using AI...";
      }

      setChatAnswers(newAnswers);
      setChatStage(newStage);
      setChatMessages([...newMessages, { role: 'assistant', text: nextAssistantMsg }]);
      setIsGenerating(false);

      if (newStage === 'generating') {
         setChatStage('done');
         generateFromAPI(newAnswers); // Calls API
      }
    }, 600);
  };



  return (
    <div className="flex flex-col bg-slate-50 min-h-screen pb-12 relative">
      <Navbar />
      {isLoading && <LoadingScreen />}

      {/* Warning message for small screens */}
      {isSmallScreen && (
        <div className="text-slate-500 text-center py-4 mt-[80px]">
          <i className="fa fa-exclamation-circle text-red-500 mr-2"></i> Small screen detected
          <p>For the best experience, please use a tablet or laptop.</p>
        </div>
      )}

      <div className={`max-w-6xl mx-auto w-full px-4 sm:px-6 ${isSmallScreen ? 'mt-4' : 'mt-[100px]'}`}>

        <div className="bg-gradient-to-b from-white to-slate-50 rounded-[24px] shadow-md border border-slate-100 p-6 md:p-10 lg:p-12 flex flex-col items-center">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 text-center tracking-tight">
            Share Your Interview Journey
          </h1>
          <p className="text-slate-500 text-sm sm:text-base text-center max-w-2xl mb-8 leading-relaxed">
            Help others succeed by sharing your authentic interview insights. Your experience can be the roadmap for someone else's career.
          </p>

          <div className="inline-flex justify-center items-center bg-blue-50 text-blue-700 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold mb-8 text-center transition hover:bg-blue-100 border border-blue-100">
            Pro Tip: Maximize the editor for a better experience!
          </div>

          <div className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-slate-700 font-medium">
              Fill details once, then switch to AI mode for faster drafting.
            </p>
            <p className="text-xs text-slate-500">
              Drafts are auto-saved every few seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-2 w-full text-left">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Batch Year</label>
              <div className="relative group">
                <select
                  value={batch}
                  onChange={handleBatchChange}
                  className={`w-full p-3.5 bg-white border ${errors.batch ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-sm focus:border-blue-400 focus:ring-2 focus:outline-none text-sm text-slate-700 appearance-none transition`}
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <i className="fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-slate-600 transition"></i>
              </div>
              {errors.batch && <p className="text-red-500 text-xs mt-1.5 font-medium">Year is required</p>}
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Department</label>
              <div className="relative group">
                <select
                  value={branch}
                  onChange={handleBranchChange}
                  className={`w-full p-3.5 bg-white border ${errors.branch ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-sm focus:border-blue-400 focus:ring-2 focus:outline-none text-sm text-slate-700 appearance-none transition`}
                >
                  <option value="">Select Department</option>
                  <option value="CS">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="EnTC">Electronics and Telecommunication</option>
                  <option value="AIDS">Artificial Intelligence & Data Science</option>
                  <option value="EC">Electronics and Computer</option>
                </select>
                <i className="fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-slate-600 transition"></i>
              </div>
              {errors.branch && <p className="text-red-500 text-xs mt-1.5 font-medium">Branch is required</p>}
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company</label>
              <div className="relative group">
                <select
                  value={company}
                  onChange={handleCompanyChange}
                  className={`w-full p-3.5 bg-white border ${errors.company ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-sm focus:border-blue-400 focus:ring-2 focus:outline-none text-sm text-slate-700 appearance-none transition`}
                >
                  <option value="">Select Company</option>
                  <option value="others">Others...</option>
                  {companies.map((comp) => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
                <i className="fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-slate-600 transition"></i>
              </div>
              {company === "others" && (
                <input
                  type="text"
                  onChange={handleCustomCompanyChange}
                  placeholder="Enter Company Name"
                  value={customCompany}
                  className={`w-full p-3.5 bg-slate-50 border ${errors.company ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-inner mt-2 text-sm focus:outline-none focus:ring-2 transition`}
                />
              )}
              {errors.company && <p className="text-red-500 text-xs mt-1.5 font-medium">Company is required</p>}
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Role</label>
              <div className="relative group">
                <select
                  value={role}
                  onChange={handleRoleChange}
                  className={`w-full p-3.5 bg-white border ${errors.role ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-sm focus:border-blue-400 focus:ring-2 focus:outline-none text-sm text-slate-700 appearance-none transition`}
                >
                  <option value="">Select Role</option>
                  <option value="others">Others...</option>
                  {roles.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>{roleOption}</option>
                  ))}
                </select>
                <i className="fa fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-slate-600 transition"></i>
              </div>
              {role === "others" && (
                <input
                  type="text"
                  onChange={handleCustomRoleChange}
                  placeholder="Enter Role"
                  value={customRole}
                  className={`w-full p-3.5 bg-slate-50 border ${errors.role ? "border-red-500 focus:ring-red-100" : "border-slate-200 focus:ring-blue-100"} rounded-xl shadow-inner mt-2 text-sm focus:outline-none focus:ring-2 transition`}
                />
              )}
              {errors.role && <p className="text-red-500 text-xs mt-1.5 font-medium">Role is required</p>}
            </div>
          </div>

          <hr className="w-full my-8 border-slate-100" />

          {/* Success message */}
          {successMessage && (
            <div className="w-full bg-[#E7F3FF] text-[#1D1D1D] p-4 rounded-xl shadow-sm mb-6 flex justify-center border border-blue-100">
              <div className="flex items-center gap-2">
                <i className="fa fa-check-circle text-green-500 text-xl"></i>
                <p className="font-semibold text-sm sm:text-base text-slate-800">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="w-full pb-8">
            <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
                {/* Toggle (Left) */}
                <div className="flex justify-start w-full xl:w-auto">
                  <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-inner h-fit w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => handleModeChange('manual')}
                      className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm rounded-lg transition-all duration-200 flex justify-center items-center gap-2.5 font-semibold whitespace-nowrap ${mode === 'manual' ? 'bg-slate-900 shadow text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                      <i className={`fa fa-pencil mt-0.5 ${mode === 'manual' ? 'text-blue-200' : 'text-blue-500'}`}></i> Manual Entry
                    </button>
                    <button
                      onClick={() => handleModeChange('ai')}
                      className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm rounded-lg transition-all duration-200 flex justify-center items-center gap-2.5 font-semibold whitespace-nowrap ${mode === 'ai' ? 'bg-purple-600 shadow text-white' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                      <i className={`fa fa-bolt ${mode === 'ai' ? 'text-purple-100' : 'text-purple-500'}`}></i> AI-Assisted Write
                    </button>
                  </div>
                </div>

                {/* Actions (Center) */}
                <div className="flex justify-center xl:justify-start w-full xl:w-auto">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleClearForm}
                      type="button"
                      className="bg-white border border-slate-200 text-slate-700 text-sm sm:text-base font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-sm px-6 py-3 w-full sm:w-auto whitespace-nowrap"
                    >
                      Clear Form
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="button"
                      className="bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm px-8 py-3 w-full sm:w-auto whitespace-nowrap"
                    >
                      Submit Experience
                    </button>
                  </div>
                </div>

                {/* Short on ideas link (Right) */}
                <div className={`w-full xl:w-auto flex justify-center xl:justify-end ${mode !== 'manual' ? 'opacity-0 pointer-events-none' : ''} transition-opacity duration-200`}>
                  <Link href="/help" onClick={handleHelpClick} className="text-blue-700 hover:text-blue-900 font-semibold transition-colors text-sm sm:text-base flex items-center gap-1.5 whitespace-nowrap bg-white border border-blue-100 rounded-xl px-4 py-3">
                    Short on ideas? <i className="fa fa-chevron-right text-[10px] mt-0.5"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full relative shadow-sm border border-slate-200 rounded-xl overflow-hidden mt-2 bg-slate-50/50">
            {/* AI Prompt Area */}
            {mode === 'ai' && (
              <div className="w-full h-full min-h-[500px] flex flex-col bg-slate-50 border-t border-purple-50">

                {/* Chat header */}
                <div className="p-4 bg-white border-b border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <i className="fa fa-robot text-lg"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 tracking-tight" style={{ color: '#0f172a' }}>AI Writing Assistant</h3>
                      <p className="text-xs text-slate-500">Fast & structured markdown generation</p>
                    </div>
                  </div>
                </div>

                {/* Chat messages area */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 min-h-[350px]">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex w-full \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3 \${msg.role === 'user' ? 'bg-purple-50 border border-purple-200 shadow-sm rounded-br-sm' : 'bg-white border border-slate-200 shadow-sm rounded-bl-sm'}`}>
                        <p
                          className={`text-sm sm:text-base whitespace-pre-wrap leading-relaxed font-semibold \${msg.role === 'user' ? 'text-slate-900' : 'text-slate-900'}`}
                        >
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loader for typing / processing */}
                  {isGenerating && (
                    <div className="flex w-full justify-start">
                      <div className="bg-white border border-slate-200 shadow-sm rounded-br-2xl rounded-tr-2xl rounded-bl-sm px-5 py-3 flex items-center gap-3">
                         <i className="fa fa-circle-notch fa-spin text-purple-500"></i>
                         <p className="text-sm font-medium text-slate-700" style={{ color: '#334155' }}>AI is thinking...</p>
                      </div>
                    </div>
                  )}

                  {/* End of messages marker removed, using container ref directly */}
                </div>

                {/* Chat input form */}
                <div className="bg-white p-4 border-t border-slate-200">
                  <form onSubmit={handleSendChatMessage} className="flex gap-3 max-w-4xl mx-auto w-full relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isGenerating || chatStage === 'generating' || chatStage === 'done'}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-slate-900 placeholder-slate-500 text-sm transition pr-14"
                      style={{ color: '#0f172a' }}
                      placeholder={chatStage === 'generating' || chatStage === 'done' ? "Generating your experience..." : "Type your answer here..."}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isGenerating || chatStage === 'generating' || chatStage === 'done'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-50 disabled:hover:bg-purple-600 shadow-sm"
                    >
                      <i className="fa fa-paper-plane text-xs"></i>
                    </button>
                  </form>
                </div>
              </div>
            )}
            {/* Markdown Editor */}
            <div className={`w-full \${mode === 'ai' ? 'hidden' : 'block'}`}>
              <MDEditor
                value={markdown}
                onChange={handleMarkdownChange}
                preview="live"
                hideToolbar={false}
                data-color-mode="light"
                className="w-full h-full border-none shadow-none"
                height={550}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}