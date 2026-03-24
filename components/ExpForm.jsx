"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, CheckCircle2, Bot, Send, PenLine, Sparkles, Copy, Calendar, Building2, GraduationCap, Briefcase, FileSignature, Check } from "lucide-react";
import ExperienceTiptapEditor from "./ExperienceTiptapEditor";

const LoadingScreen = ({ isDarkMode = false }) => (
  <div className={`fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center ${isDarkMode ? "bg-black/60" : "bg-gray-500/50"}`}>
    <div className={`h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 ${isDarkMode ? "border-cyan-300" : "border-blue-500"}`}></div>
  </div>
);

const getEditorPlainText = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const INTERVIEW_TEMPLATE = `## Interview Experience Template

Welcome to your Interview Experience Guide! This template is here to help you share your journey in a way that is informative and exciting. Feel free to customize it as you wish and help future aspirants.

---

### 1. Company and Role

- **Company:** [Company Name] (e.g., Google, Microsoft, Startup X)
- **Role:** [Job Title] (e.g., SDE Intern, Software Engineer, Data Scientist)
- **Batch/Year of Graduation:** [Your Graduation Year] (e.g., 2024, 2023)
- **Branch:** [Your Branch of Engineering] (e.g., Computer Science, IT, Electronics)

---

### 2. Application Process

- **How did you apply?** (e.g., LinkedIn, Company Website, Referral, On-Campus)
- **Timeline:**
  - **Application Date:** [Date]
  - **Online Assessment Date:** [Date] (if applicable)
  - **Interview Dates:** [Date(s)]
  - **Offer Date:** [Date] (if applicable)

---

### 3. Interview Rounds

#### Round 1: [Round Name] (e.g., Online Assessment, Technical Interview 1)
- **Type:** [e.g., Coding, MCQ, Technical, HR]
- **Description:** [Detailed description of the round. What kind of questions were asked? Coding problems, DSA concepts, System Design, Behavioral questions etc.]
  - **Example Questions:**
    1. [Question 1]
    2. [Question 2]
    3. [Question 3]
- **Difficulty Level:** [Easy, Medium, Hard]
- **Your Experience:** [How did you perform? What was challenging? Tips for this round?]

#### Round 2: [Round Name] (e.g., Technical Interview 2, HR Round)
- **Type:** [e.g., Coding, Technical, HR, Managerial]
- **Description:** [Detailed description of the round]
  - **Example Questions:**
    1. [Question 1]
    2. [Question 2]
- **Difficulty Level:** [Easy, Medium, Hard]
- **Your Experience:** [Your performance and tips]

#### Round 3 (and subsequent rounds if any):
- [Follow the same format as above for each round.]

---

### 4. Overall Experience and Tips

- **Overall Interview Experience:** [How was your overall experience with the company? Positive, negative, or neutral?]
- **What to prepare?** [List of topics to prepare for this company and role, e.g., DSA, System Design, specific technologies, behavioral questions.]
- **Tips for Aspirants:** [Any general tips or advice for future candidates?]
- **Verdict:** [Selected/Rejected/Waiting] (Optional)

### 5. 🖼️ **Add Images!**
![image](https://i.imgflip.com/9jbjc6.jpg)

Feel free to upload any image that showcases your interview experience—perhaps a photo of the company’s office or your work environment. Visuals help make your experience even more relatable!

---

### 6. Additional Comments (Optional)

- [Any other information you want to share, e.g., interviewer feedback, company culture insights, salary discussions, etc.]

---

### Code Snippet Example (Optional)

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\`

---

Be as detailed as possible, and replace the placeholders with your actual interview details.`;


export default function MdxEditorPage({ isDarkMode = false, onToggleDarkMode, showThemeToggle = false }) {
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

  const initialMessage = "Hi! I'll help you write a useful interview post for juniors. First, what were the exact eligibility/shortlisting criteria (CGPA cutoff, branches allowed, backlogs, resume screening, OA shortlist, etc.)?";

  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: initialMessage }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatStage, setChatStage] = useState('eligibility'); // eligibility -> ... -> verdict -> generating -> done
  const [totalRounds, setTotalRounds] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const [chatAnswers, setChatAnswers] = useState({
    eligibility: "",
    applicationRoute: "",
    roundsText: "",
    roundDetails: [],
    timeline: "",
    difficulty: "",
    keyTopics: "",
    codingSpecifics: "",
    interviewFocus: "",
    projectDeepDive: "",
    hrBehavioral: "",
    unexpected: "",
    mistakesToAvoid: "",
    prepStrategy: "",
    sevenDayPlan: "",
    offerDetails: "",
    verdictAndTips: ""
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
        return !getEditorPlainText(value);
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


  const handleCopyTemplate = () => {
    setMode("manual");
    setMarkdown(INTERVIEW_TEMPLATE);
    setErrors((prevErrors) => ({
      ...prevErrors,
      markdown: false,
    }));
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
    setChatStage('eligibility');
    setTotalRounds(0);
    setCurrentRound(1);
    setChatAnswers({
      eligibility: "",
      applicationRoute: "",
      roundsText: "",
      roundDetails: [],
      timeline: "",
      difficulty: "",
      keyTopics: "",
      codingSpecifics: "",
      interviewFocus: "",
      projectDeepDive: "",
      hrBehavioral: "",
      unexpected: "",
      mistakesToAvoid: "",
      prepStrategy: "",
      sevenDayPlan: "",
      offerDetails: "",
      verdictAndTips: ""
    });
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
        shortlisting: finalAnswers.eligibility,
        eligibility: finalAnswers.eligibility,
        applicationRoute: finalAnswers.applicationRoute,
        rounds: finalAnswers.roundsText,
        topics: roundsList, // Condensed from the round loop
        timeline: finalAnswers.timeline,
        difficulty: finalAnswers.difficulty,
        keyTopics: finalAnswers.keyTopics,
        codingSpecifics: finalAnswers.codingSpecifics,
        interviewFocus: finalAnswers.interviewFocus,
        projectDeepDive: finalAnswers.projectDeepDive,
        hrBehavioral: finalAnswers.hrBehavioral,
        unexpected: finalAnswers.unexpected,
        mistakesToAvoid: finalAnswers.mistakesToAvoid,
        prepStrategy: finalAnswers.prepStrategy,
        sevenDayPlan: finalAnswers.sevenDayPlan,
        offerDetails: finalAnswers.offerDetails,
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
        setChatStage('eligibility');
        setTotalRounds(0);
        setCurrentRound(1);
        setChatAnswers({
          eligibility: "",
          applicationRoute: "",
          roundsText: "",
          roundDetails: [],
          timeline: "",
          difficulty: "",
          keyTopics: "",
          codingSpecifics: "",
          interviewFocus: "",
          projectDeepDive: "",
          hrBehavioral: "",
          unexpected: "",
          mistakesToAvoid: "",
          prepStrategy: "",
          sevenDayPlan: "",
          offerDetails: "",
          verdictAndTips: ""
        });
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

      if (chatStage === 'eligibility') {
        newAnswers.eligibility = userMsg;
        newStage = 'application_route';
        nextAssistantMsg = "Great. How did you apply (on campus, referral, off-campus) and when did the process start?";
      }
      else if (chatStage === 'application_route') {
        newAnswers.applicationRoute = userMsg;
        newStage = 'rounds_count';
        nextAssistantMsg = "Nice. How many interview rounds were there in total? (e.g. 3)";
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
          newStage = 'timeline';
          nextAssistantMsg = "Thanks! What was the timeline like (days between rounds + approximate duration of each round)?";
        }
      }
      else if (chatStage === 'timeline') {
        newAnswers.timeline = userMsg;
        newStage = 'difficulty';
        nextAssistantMsg = "How difficult was each round (easy/medium/hard) and why?";
      }
      else if (chatStage === 'difficulty') {
        newAnswers.difficulty = userMsg;
        newStage = 'key_topics';
        nextAssistantMsg = "Which topics were asked the most (DSA, DBMS, OS, CN, OOP, core subjects, etc.)?";
      }
      else if (chatStage === 'key_topics') {
        newAnswers.keyTopics = userMsg;
        newStage = 'coding_specifics';
        nextAssistantMsg = "Share coding specifics: question patterns, expected approach, constraints, and any optimizations discussed.";
      }
      else if (chatStage === 'coding_specifics') {
        newAnswers.codingSpecifics = userMsg;
        newStage = 'interview_focus';
        nextAssistantMsg = "What did interviewers focus on more: problem-solving, fundamentals, projects, communication, or all equally?";
      }
      else if (chatStage === 'interview_focus') {
        newAnswers.interviewFocus = userMsg;
        newStage = 'project_deep_dive';
        nextAssistantMsg = "Any project deep-dive questions (architecture, trade-offs, scalability, debugging)?";
      }
      else if (chatStage === 'project_deep_dive') {
        newAnswers.projectDeepDive = userMsg;
        newStage = 'hr_behavioral';
        nextAssistantMsg = "What HR/behavioral questions came up, and which answers worked well for you?";
      }
      else if (chatStage === 'hr_behavioral') {
        newAnswers.hrBehavioral = userMsg;
        newStage = 'unexpected';
        nextAssistantMsg = "Any surprise or tricky moments, and how did you handle them?";
      }
      else if (chatStage === 'unexpected') {
        newAnswers.unexpected = userMsg;
        newStage = 'mistakes';
        nextAssistantMsg = "What common mistakes should juniors avoid in this process?";
      }
      else if (chatStage === 'mistakes') {
        newAnswers.mistakesToAvoid = userMsg;
        newStage = 'prep_strategy';
        nextAssistantMsg = "What preparation strategy/resources helped most (platforms, sheets, mock interviews, timelines)?";
      }
      else if (chatStage === 'prep_strategy') {
        newAnswers.prepStrategy = userMsg;
        newStage = 'seven_day_plan';
        nextAssistantMsg = "If someone has only 7 days, what should they prioritize day-wise or topic-wise?";
      }
      else if (chatStage === 'seven_day_plan') {
        newAnswers.sevenDayPlan = userMsg;
        newStage = 'offer_details';
        nextAssistantMsg = "Optional: share offer details if comfortable (role type, location, package range). You can type 'skip' too.";
      }
      else if (chatStage === 'offer_details') {
        newAnswers.offerDetails = userMsg;
        newStage = 'verdict';
        nextAssistantMsg = "Finally, what was the final verdict (Selected/Rejected/Waitlisted), and your top tips for future students?";
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
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[radial-gradient(circle_at_10%_14%,rgba(125,211,252,0.22),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(129,140,248,0.2),transparent_34%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_55%,#f1f5f9_100%)] pb-12 dark:bg-[radial-gradient(circle_at_10%_14%,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(45,212,191,0.14),transparent_34%),linear-gradient(180deg,#020617_0%,#0b1120_55%,#111827_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:radial-gradient(ellipse_at_top,black_42%,transparent_85%)] dark:bg-[linear-gradient(to_right,rgba(51,65,85,0.45)_1px,transparent_1px),linear-gradient(to_bottom,rgba(51,65,85,0.45)_1px,transparent_1px)]" />
      <div className="pointer-events-none absolute left-[-140px] top-24 h-96 w-96 rounded-full bg-sky-300/20 blur-[100px] dark:bg-sky-500/20" />
      <div className="pointer-events-none absolute right-[-120px] top-[320px] h-96 w-96 rounded-full bg-indigo-400/20 blur-[100px] dark:bg-indigo-500/20" />
      <Navbar showThemeToggle={showThemeToggle} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      {isLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      {/* Warning message for small screens */}
      {isSmallScreen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-4 mt-[80px] flex items-center justify-center gap-2 rounded-[20px] border border-white/60 bg-white/60 px-4 py-3 text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200 md:hidden">
          <AlertCircle className="h-[18px] w-[18px] text-indigo-500 dark:text-cyan-300" />
          <p className="text-[13px] font-bold tracking-tight">Best experienced on a tablet or laptop.</p>
        </motion.div>
      )}

      <div className={`relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 ${isSmallScreen ? 'mt-4' : 'mt-[100px]'}`}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_14px_36px_rgba(2,6,23,0.65)] sm:rounded-[2.5rem] sm:p-8 md:p-10 lg:p-12"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-100/40 via-indigo-100/20 to-transparent dark:from-cyan-900/20 dark:via-blue-900/15" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-[80px] dark:bg-cyan-500/15" />
          <div className="pointer-events-none absolute -left-20 top-40 h-64 w-64 rounded-full bg-purple-400/10 blur-[80px] dark:bg-indigo-500/15" />

          <div className="relative text-center mx-auto max-w-3xl mb-8 sm:mb-12">
            <h1 className="mb-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-[28px] font-extrabold leading-tight tracking-tight text-transparent dark:from-slate-100 dark:via-cyan-300 dark:to-blue-300 sm:mb-6 sm:text-5xl lg:text-6xl">
              Share Your Journey
            </h1>
            <p className="mx-auto px-1 text-[15px] leading-relaxed text-[#111827] dark:text-slate-300 sm:px-0">
              Help others succeed by sharing your authentic interview insights. Your experience can be the roadmap for someone else's career.
            </p>
          </div>

          <div className="mb-8 w-full animate-fade-in-up">
            <div className="flex flex-col gap-3 rounded-[20px] border border-white/60 bg-white/50 p-4 shadow-sm backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/75 sm:rounded-2xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-blue-100/80 text-blue-600 dark:bg-cyan-950/40 dark:text-cyan-300">
                  <FileSignature className="h-5 w-5" />
                </div>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                  Fill details below, then choose Manual or AI mode.
                </p>
              </div>
              <div className="flex items-center gap-2 px-2 sm:px-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">Auto-saving</p>
              </div>
            </div>
          </div>

          <div className="mb-10 grid w-full grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Batch */}
            <div className={`group relative rounded-[20px] transition-all duration-300 ${errors.batch ? "border border-red-300 bg-red-50/50 dark:border-rose-500/40 dark:bg-rose-950/25" : "border border-white/60 bg-white/50 shadow-sm backdrop-blur-lg hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:border-slate-500 dark:hover:bg-slate-900"}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Batch Year</label>
                </div>
                <div className="relative">
                  <select
                    value={batch}
                    onChange={handleBatchChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-bold text-slate-700 shadow-inner transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>
                {errors.batch && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
              </div>
            </div>

            {/* Department */}
            <div className={`group relative rounded-[20px] transition-all duration-300 ${errors.branch ? "border border-red-300 bg-red-50/50 dark:border-rose-500/40 dark:bg-rose-950/25" : "border border-white/60 bg-white/50 shadow-sm backdrop-blur-lg hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:border-slate-500 dark:hover:bg-slate-900"}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Department</label>
                </div>
                <div className="relative">
                  <select
                    value={branch}
                    onChange={handleBranchChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-bold text-slate-700 shadow-inner transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">Select Dept</option>
                    <option value="CS">Computer Science</option>
                    <option value="IT">Information Technology</option>
                    <option value="EnTC">E&TC</option>
                    <option value="AIDS">AI & Data Science</option>
                    <option value="EC">Electronics & Comp</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>
                {errors.branch && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
              </div>
            </div>

            {/* Company */}
            <div className={`group relative rounded-[20px] transition-all duration-300 ${errors.company ? "border border-red-300 bg-red-50/50 dark:border-rose-500/40 dark:bg-rose-950/25" : "border border-white/60 bg-white/50 shadow-sm backdrop-blur-lg hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:border-slate-500 dark:hover:bg-slate-900"}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Company</label>
                </div>
                <div className="relative">
                  <select
                    value={company}
                    onChange={handleCompanyChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-bold text-slate-700 shadow-inner transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">Select Company</option>
                    <option value="others">Others...</option>
                    {companies.map((comp) => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>
                {company === "others" && (
                  <motion.input
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                    type="text"
                    onChange={handleCustomCompanyChange}
                    placeholder="Enter Company"
                    value={customCompany}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                  />
                )}
                {errors.company && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
              </div>
            </div>

            {/* Role */}
            <div className={`group relative rounded-[20px] transition-all duration-300 ${errors.role ? "border border-red-300 bg-red-50/50 dark:border-rose-500/40 dark:bg-rose-950/25" : "border border-white/60 bg-white/50 shadow-sm backdrop-blur-lg hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900/75 dark:hover:border-slate-500 dark:hover:bg-slate-900"}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Role</label>
                </div>
                <div className="relative">
                  <select
                    value={role}
                    onChange={handleRoleChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-[13px] font-bold text-slate-700 shadow-inner transition-all focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-500/10 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:bg-slate-900 dark:focus:ring-cyan-500/20 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    <option value="">Select Role</option>
                    <option value="others">Others...</option>
                    {roles.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>{roleOption}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300" />
                </div>
                {role === "others" && (
                  <motion.input
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                    type="text"
                    onChange={handleCustomRoleChange}
                    placeholder="Enter Role"
                    value={customRole}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-inner transition focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                  />
                )}
                {errors.role && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-8 flex w-full justify-center rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-[#1D1D1D] shadow-sm backdrop-blur-sm dark:border-emerald-500/35 dark:bg-emerald-950/35 dark:text-slate-100"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 sm:text-base">{successMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="w-full pb-8">
            <div className="sticky top-4 z-30 mb-6 w-full rounded-[20px] border border-white/60 bg-white/50 p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-3xl transition-all dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_12px_34px_rgba(2,6,23,0.65)] sm:rounded-2xl sm:p-3">
              <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
                {/* Toggle (Left) */}
                <div className="flex w-full justify-start xl:w-auto">
                  <div className="relative flex h-[46px] w-full rounded-xl border border-white/40 bg-slate-100/60 p-1 shadow-inner dark:border-slate-700 dark:bg-slate-800/85 sm:h-[52px] sm:w-auto">
                    <button
                      onClick={() => handleModeChange('manual')}
                      className={`relative z-10 flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-bold transition-colors duration-300 sm:flex-none sm:px-6 sm:text-sm ${mode === 'manual' ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                      <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Manual Writer
                    </button>
                    <button
                      onClick={() => handleModeChange('ai')}
                      className={`relative z-10 flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[13px] font-bold transition-colors duration-300 sm:flex-none sm:px-6 sm:text-sm ${mode === 'ai' ? 'text-indigo-700 dark:text-cyan-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> AI Assistant
                    </button>

                    {/* Animated pill background */}
                    <div
                      className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white shadow-sm transition-all duration-300 ease-out dark:bg-slate-900 sm:w-[150px] ${mode === 'manual' ? 'left-1' : 'left-[calc(50%+2px)] sm:left-[156px]'}`}
                      style={{
                        border: mode === 'ai' ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid rgba(226, 232, 240, 0.4)'
                      }}
                    />
                  </div>
                </div>

                <div className="flex w-full flex-row gap-2.5 justify-center xl:w-auto xl:justify-start">
                  <div className="flex w-full items-center gap-2.5 sm:gap-3 sm:w-auto">
                    <button
                      onClick={handleClearForm}
                      type="button"
                      className="group flex w-[35%] items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-white/60 bg-white/60 px-3 py-2.5 text-[13px] font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900 sm:w-auto sm:gap-2 sm:px-6 sm:py-3 sm:text-sm"
                    >
                      <span className="group-hover:text-red-500 transition-colors">Clear</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      type="button"
                      className="group flex w-[65%] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] active:scale-95 dark:bg-cyan-600 dark:text-slate-950 dark:shadow-cyan-950/45 dark:hover:bg-cyan-500 sm:w-auto sm:px-8 sm:py-3 sm:text-sm"
                    >
                      <span>Submit Post</span>
                      <Check className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                </div>

                {/* Copy template button (Right) */}
                <div className={`hidden sm:flex w-full justify-center transition-all duration-300 xl:w-auto xl:justify-end ${mode !== 'manual' ? 'pointer-events-none opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-[13px] font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-800 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-200 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
                  >
                    Template <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative mt-2 w-full overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/60 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/75 dark:shadow-[0_18px_44px_rgba(2,6,23,0.65)]">

              {/* AI Prompt Area */}
              {mode === 'ai' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full min-h-[600px] w-full flex-col bg-slate-50/50 dark:bg-slate-900/80"
                >
                  {/* Chat header */}
                  <div className="flex items-center justify-between border-b border-indigo-100/50 bg-white/80 px-6 py-5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-inner dark:border-slate-700 dark:from-cyan-950/40 dark:to-blue-950/40 dark:text-cyan-300">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Interview AI Guide</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">I'll help structure your experience flawlessly</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat messages area */}
                  <div ref={chatContainerRef} className="flex min-h-[400px] flex-1 flex-col gap-6 overflow-y-auto rounded-b-xl bg-[url('/grid-bg.svg')] bg-center p-4 dark:bg-none sm:p-8">
                    {chatMessages.map((msg, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        key={index}
                        className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white bg-indigo-100 shadow-sm dark:border-slate-700 dark:bg-cyan-950/40">
                            <Bot className="w-4 h-4 text-indigo-600" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm sm:max-w-[75%] ${msg.role === 'user' ? 'rounded-br-sm bg-indigo-600 text-white dark:bg-cyan-600 dark:text-slate-950' : 'rounded-bl-sm border border-slate-200/60 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}`}>
                          <p className="text-sm sm:text-[15px] whitespace-pre-wrap leading-relaxed font-medium">
                            {msg.text}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Loader for typing / processing */}
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex w-full justify-start"
                      >
                        <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white bg-indigo-100 shadow-sm dark:border-slate-700 dark:bg-cyan-950/40">
                          <Bot className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-slate-200/60 bg-white px-6 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                          <div className="flex items-center gap-1.5">
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-indigo-400"></motion.span>
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-indigo-400"></motion.span>
                            <motion.span animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-indigo-400"></motion.span>
                          </div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Processing response...</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Chat input form */}
                  <div className="rounded-b-[2rem] border-t border-slate-200/60 bg-white/90 p-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/90 sm:p-6">
                    <form onSubmit={handleSendChatMessage} className="flex gap-3 max-w-4xl mx-auto w-full relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isGenerating || chatStage === 'generating' || chatStage === 'done'}
                        className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-6 py-4 pr-16 text-[15px] font-medium text-slate-800 shadow-inner transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                        placeholder={chatStage === 'generating' || chatStage === 'done' ? "✨ Generating your perfect experience post..." : "Type your answer here..."}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isGenerating || chatStage === 'generating' || chatStage === 'done'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-indigo-600 shadow-sm"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
              {/* Markdown Editor */}
              <div className={`w-full ${mode === 'ai' ? 'hidden' : 'block'}`}>
                <ExperienceTiptapEditor
                  value={markdown}
                  onChange={handleMarkdownChange}
                  minHeight={650}
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
      <style jsx>{`
        @keyframes chatBubbleIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
