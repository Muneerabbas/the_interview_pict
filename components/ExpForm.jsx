"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, CheckCircle2, Send, PenLine, Sparkles, Copy, Calendar, Building2, GraduationCap, Briefcase, FileSignature, Check } from "lucide-react";
import ExperienceTiptapEditor from "./ExperienceTiptapEditor";
import Image from "next/image";
import postCompanies from "@/data/post-companies.json";
import { useTheme } from "next-themes";
import SearchableDropdown from "./SearchableDropdown";
import AddCompanyModal from "@/components/AddCompanyModal";

const LoadingScreen = ({ isDarkMode = false }) => (
  <div className={`fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center ${isDarkMode ? "bg-black/65" : "bg-slate-900/25"} backdrop-blur-sm`}>
    <div className="relative flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.2)] dark:border-slate-700/80 dark:bg-slate-900/95">
      <span className={`pointer-events-none absolute inset-0 rounded-2xl blur-xl animate-pulse ${isDarkMode ? "bg-cyan-400/10" : "bg-blue-500/10"}`} />
      <span className={`absolute h-16 w-16 rounded-full border ${isDarkMode ? "border-cyan-400/25 border-t-cyan-300" : "border-blue-500/25 border-t-blue-600"} animate-spin`} />
      <div className="relative h-11 w-11">
        <Image src="/app_icon.png" alt="theInterview loading" fill sizes="44px" className="object-contain" />
      </div>
    </div>
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

const TALE_TEMPLATE = `# 🏆 [Insert an Epic & Clicky Title Here]

> *"Sometimes the best code is the code you delete." — Share a hook, a quote, or the craziest thing that happened right at the start.* 🤯

---

## 🧭 The Context
Before we dive into the chaos, here’s the TL;DR:
- **🎯 What was it?** [e.g., SIH Hackathon, College Project, Scaling my first SaaS, Solving a prod bug]
- **🕒 Timeline:** [e.g., 48 intense hours, A gruelling 2-month grind]
- **💻 Tech Stack:** \`[React, Node.js, Postgres, Duct Tape & Prayers]\`
- **👥 The Squad:** [e.g., Me + 2 friends who didn't know how to center a div]

---

## 🚀 The Launch (Expectation)
*Every great journey starts with a naive sense of optimism. What was the original grand vision? What were you trying to build or achieve?*

[Type your grand vision here...]

## 💥 The Crash (Reality)
*Then it all went wrong. Every great story needs a villain. Was it a nasty bug? A server crash? A teammate disappearing?*

- **The moment we realized:** [Ouch]
- **The biggest roadblock:** [Yikes]
- **Our reaction:** [Panic]

## 🛠️ The Pivot & The Fix
*How did you survive? How did you pivot? Share the late-night hacks, the Stack Overflow thread that saved you, or the chaotic redesign.*

[Type your redemption arc here...]

---

## 🧠 Platinum Takeaways
If someone else is trying this tomorrow, here is my raw advice:
1. **✅ Do This:** [e.g., Always test on mobile FIRST.]
2. **❌ Avoid This:** [e.g., Don't try to learn a new framework 12 hours before submission.]
3. **💡 Unspoken Truth:** [e.g., Sleep > 3 extra hours of buggy coding.]

---

## 📸 Hall of Fame (or Shame)
*(Pro tip: Hit ENTER and drag/drop your behind-the-scenes pics here!)*
![Memories](https://i.imgflip.com/9jbjc6.jpg)

---

### 🏁 Final Verdict
**Would I do it again?** [Yes / No / Maybe if paid]  
**Rating:** ⭐⭐⭐⭐⭐

*Liked my story? Feel free to connect with me or drop a comment if you've been in the same boat!*
`;


export default function MdxEditorPage({ showThemeToggle = false, contentType = "interview" }) {
  const { resolvedTheme } = useTheme();
  const [mountedTheme, setMountedTheme] = useState(false);
  useEffect(() => setMountedTheme(true), []);
  const isDarkMode = mountedTheme && resolvedTheme === "dark";

  const [title, setTitle] = useState("");

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { data: session } = useSession();
  const [markdown, setMarkdown] = useState("");
  const [college, setCollege] = useState("");
  const [customCollege, setCustomCollege] = useState("");
  const [batch, setBatch] = useState("");
  const [branch, setBranch] = useState("");
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [height, setHeight] = useState("100vh");
  const [bottomMargin, setBottomMargin] = useState("0");
  const [errors, setErrors] = useState({
    college: false,
    batch: false,
    branch: false,
    company: false,
    role: false,
    title: false,
    markdown: false,
  });
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [previousMarkdown, setPreviousMarkdown] = useState("");
  const [mode, setMode] = useState("manual");
  const isTale = contentType === "tale";

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

  const years = Array.from({ length: 30 }, (_, index) => 2000 + index).reverse();
  const [isLoading, setIsLoading] = useState(false);

  const roles = ["Intern", "SDE", "QA", "Data Scientist", "Product Manager", "UX/UI Designer", "Business Analyst", "DevOps Engineer", "Machine Learning Engineer", "Cybersecurity Analyst", "Cloud Architect", "Systems Engineer", "Full Stack Developer", "Front-End Developer", "Back-End Developer", "Database Administrator (DBA)", "Software Engineer in Test (SET)", "Solutions Architect", "Network Engineer", "Site Reliability Engineer (SRE)", "Security Engineer", "Data Analyst", "Product Designer", "AI Engineer", "BI Analyst", "Marketing Manager", "Sales Engineer", "Customer Success Manager", "Technical Support Specialist", "HR Manager", "Talent Acquisition Specialist", "Project Manager", "Content Strategist", "Technical Writer", "Digital Marketing Manager", "Community Manager", "Legal Counsel", "PR Specialist", "Customer Support Specialist", "Business Development Manager", "Finance Analyst", "Operations Manager", "Product Marketing Manager", "Scrum Master", "Game Developer", "Blockchain Developer"];
  const branchOptions = [
    { label: "Computer Science", value: "CS" },
    { label: "Information Technology", value: "IT" },
    { label: "E&TC", value: "EnTC" },
    { label: "AI & Data Science", value: "AIDS" },
    { label: "Electronics & Comp", value: "EC" },
    { label: "Mechanical Engineering", value: "ME" },
    { label: "Civil Engineering", value: "CE" },
    { label: "Electrical Engineering", value: "EE" },
    { label: "Chemical Engineering", value: "CHE" },
    { label: "Instrumentation Engineering", value: "INSTR" },
    { label: "Production Engineering", value: "PROD" },
    { label: "Automobile Engineering", value: "AUTO" },
    { label: "Robotics & Automation", value: "ROBO" },
    { label: "Aerospace Engineering", value: "AERO" },
    { label: "Biomedical Engineering", value: "BIO" },
    { label: "Biotechnology", value: "BIOTECH" },
    { label: "Computer Engineering", value: "COMP" },
    { label: "AI & Machine Learning", value: "AIML" },
    { label: "Data Science", value: "DS" },
    { label: "Industrial Engineering", value: "IE" },
    { label: "Metallurgy Engineering", value: "META" },
    { label: "Mining Engineering", value: "MIN" },
    { label: "Mechatronics", value: "MECHATRONICS" },
    { label: "Environmental Engineering", value: "ENV" },
  ];
  const COLLEGE_PAGE_SIZE = 20;
  const [colleges, setColleges] = useState([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [collegePage, setCollegePage] = useState(1);
  const [collegeHasMore, setCollegeHasMore] = useState(false);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [companies, setCompanies] = useState(postCompanies);

  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyInitialName, setNewCompanyInitialName] = useState("");

  const loadColleges = async (query, pageToLoad) => {
    setCollegeLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        page: String(pageToLoad),
        limit: String(COLLEGE_PAGE_SIZE),
      });
      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setColleges((prev) => (
          pageToLoad === 1
            ? data.data
            : Array.from(new Set([...prev, ...data.data]))
        ));
        setCollegePage(pageToLoad);
        setCollegeHasMore(Boolean(data.pagination?.hasMore));
      }
    } catch (err) {
      console.error("Could not fetch colleges", err);
    } finally {
      setCollegeLoading(false);
    }
  };

  useEffect(() => {
    loadColleges(collegeSearchTerm, 1);
  }, [collegeSearchTerm]);

  useEffect(() => {
    fetch("/api/getCompanies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const dbCompanyNames = data.data.map(c => c.name).filter(Boolean);
          setCompanies(Array.from(new Set([...postCompanies, ...dbCompanyNames])));
        }
      })
      .catch((err) => console.error("Could not fetch generic companies", err));
  }, []);

  const handleAddCompanyAction = (searchTerm) => {
    setNewCompanyInitialName(searchTerm);
    setShowAddCompanyModal(true);
  };

  const handleAddCompanySuccess = (newCompanyObj) => {
    setCompanies((prev) => Array.from(new Set([...prev, newCompanyObj.name])));
    setCompany(newCompanyObj.name);
    setCustomCompany("");
  };


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
        const response = await fetch(`/api/drafts?email=${session.user.email}&contentType=${contentType}`);
        if (response.ok) {
          const draftData = await response.json();
          setMarkdown(draftData.exp_text || "");
          setTitle(draftData.title || "");
          setCollege(draftData.college || "");
          setCustomCollege(draftData.customCollege || "");
          setBatch(draftData.batch || "");
          setBranch(draftData.branch || "");
          setCompany(draftData.company || "");
          setRole(draftData.role || "");
          // Load AI state
          if (draftData.chatAnswers) setChatAnswers(draftData.chatAnswers);
          if (draftData.chatStage) setChatStage(draftData.chatStage);
          if (draftData.chatMessages && draftData.chatMessages.length > 0) {
            setChatMessages(draftData.chatMessages);
          }
          if (draftData.totalRounds) setTotalRounds(draftData.totalRounds);
          if (draftData.currentRound) setCurrentRound(draftData.currentRound);
        } else if (response.status === 404) {
          // Reset to default if no draft found for this type
          setMarkdown(isTale ? TALE_TEMPLATE : INTERVIEW_TEMPLATE);
          setTitle("");
          setCollege("");
          setCustomCollege("");
          setBatch("");
          setBranch("");
          setCompany("");
          setRole("");
          setChatAnswers({ eligibility: "", applicationRoute: "", roundsText: "", roundDetails: [], timeline: "", difficulty: "", keyTopics: "", codingSpecifics: "", interviewFocus: "", projectDeepDive: "", hrBehavioral: "" });
          setChatStage('eligibility');
          setChatMessages([{ role: 'assistant', text: initialMessage }]);
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };

    loadDraft();
  }, [session?.user?.email, contentType]);

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
            content_type: contentType
          }),
        });
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, 2000),
    [session, contentType]
  );



  // Validation function for specific fields
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'college':
        if (isTale) return false;
        return !value || (value === 'others' && !customCollege);
      case 'batch':
        if (isTale) return false;
        return !value;
      case 'branch':
        if (isTale) return false;
        return !value;
      case 'company':
        if (isTale) return false;
        return !value || (value === 'others' && !customCompany);
      case 'role':
        if (isTale) return false;
        return !value || (value === 'others' && !customRole);
      case 'title':
        return isTale && !value.trim();
      case 'markdown':
        return !getEditorPlainText(value);
      default:
        return false;
    }
  };

  // Handle input changes and validate only the relevant field
  const handleCollegeChange = (value) => {
    setCollege(value);
    if (value !== "others") {
      setCustomCollege("");
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      college: validateField('college', value),
    }));
  };

  const handleCustomCollegeChange = (e) => {
    setCustomCollege(e.target.value);
  };

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

  const handleCompanyChange = (value) => {
    setCompany(value);
    if (!isTale && value !== "others") {
      setCustomCompany(""); // Reset custom company when a predefined one is selected
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      company: validateField('company', value),
    }));
  };

  const handleCustomCompanyChange = (e) => {
    setCustomCompany(e.target.value);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (!isTale && value !== "others") {
      setCustomRole(""); // Reset custom role when a predefined one is selected
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      role: validateField('role', value),
    }));
  };

  const handleCustomRoleChange = (e) => {
    setCustomRole(e.target.value); // Update custom role state when user types in the input field
  };

  const validateRequiredMetaForAI = () => {
    if (isTale) {
      alert("AI writer for hackathon posts is under development.");
      return false;
    }

    const requiredErrors = {
      college: validateField('college', college),
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
    if (nextMode === 'ai' && isTale) {
      alert("AI writer for hackathon posts is under development.");
      return;
    }
    if (nextMode === 'ai' && !validateRequiredMetaForAI()) {
      alert("Please select College, Batch, Department, Company, and Role before using AI.");
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

  const handleEditorError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000); // Clear error after 5s
  };

  const handleSubmit = async () => {
    if (!session) {
      alert("You need to be logged in to submit!");
      return;
    }

    // Validate all fields one last time before submitting
    const newErrors = {
      college: validateField('college', college),
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

    // Determine the final values (use custom values if "Others..." is selected)
    const finalCollege = college === 'others' ? customCollege : college;
    const finalCompany = isTale ? (finalCollege || "General Story") : (company === 'others' ? customCompany : company);
    const finalRole = isTale ? "" : role === 'others' ? customRole : role;

    const payload = {
      exp_text: markdown,
      name: session?.user?.name || session?.user?.email?.split('@')[0] || "Contributor",
      profile_pic: session?.user?.image,
      college: finalCollege || "",
      batch: batch || "",
      branch: branch || "",
      company: finalCompany || "General Story",
      role: finalRole || "",
      email: session?.user?.email,
      content_type: contentType,
      title: title || (isTale ? "Untitled Story" : "")
    };

    console.log("📤 Submitting Payload:", payload);
    setIsLoading(true);

    try {
      const response = await fetch("/api/saveExp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("❌ Server Error Details:", data);
        throw new Error(data.message || "Failed to submit markdown");
      }

      // After successful submission, reset the draft
      setCollege("");
      setBatch("");
      setBranch("");
      setCompany("");
      setRole("");
      setMarkdown("");
      setTitle("");
      setErrors({
        college: false,
        batch: false,
        branch: false,
        company: false,
        role: false,
        title: false,
        markdown: false,
      });

      // Delete the draft from the backend
      await fetch("/api/deleteDraft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          content_type: contentType
        }),
      });

      // Invalidate frontend feed cache
      if (isTale) {
        sessionStorage.removeItem("tales_state_v1:latest");
        sessionStorage.removeItem("tales_state_v1:trending");
      } else {
        sessionStorage.removeItem("feed_state_v2:latest");
        sessionStorage.removeItem("feed_state_v2:trending");
      }

      // Show success message
      setSuccessMessage("Your experience has been successfully submitted!");


      // Redirect to home after 2 seconds (for smooth UX)
      // Loading will be true until new page loads and this component unmounts
      window.location.href = `/ single / ${data.uid} `;


    } catch (error) {
      console.error("Error submitting markdown:", error);
      alert("There was an error submitting your markdown.");
      setIsLoading(false); // Stop loading in case of error
    }
  };

  useEffect(() => {
    if (session?.user?.email) {
      saveDraft({
        exp_text: markdown,
        title,
        college,
        customCollege,
        batch,
        branch,
        company,
        role,
        chatAnswers,
        chatStage,
        chatMessages,
        totalRounds,
        currentRound,
      });
    }
  }, [markdown, title, college, customCollege, batch, branch, company, role, chatAnswers, chatStage, chatMessages, totalRounds, currentRound, saveDraft, session?.user?.email]);

  useEffect(() => {
    setMode("manual");
    setIsGenerating(false);
    setChatInput("");
  }, [contentType]);


  const handleCopyTemplate = () => {
    setMode("manual");
    setMarkdown(isTale ? TALE_TEMPLATE : INTERVIEW_TEMPLATE);
    setErrors((prevErrors) => ({
      ...prevErrors,
      markdown: false,
    }));
  };

  const handleClearForm = () => {
    setTitle("");
    setCollege("");
    setCustomCollege("");
    setBatch("");
    setBranch("");
    setCompany("");
    setCustomCompany("");
    setRole("");
    setCustomRole("");
    setMarkdown("");
    setChatInput("");
    setErrors({
      college: false,
      batch: false,
      branch: false,
      company: false,
      role: false,
      title: false,
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
        company: isTale ? company || "Not specified" : company === 'others' ? customCompany : company || "Not specified",
        role: isTale ? role || "Not specified" : role === 'others' ? customRole : role || "Not specified",
        college: (college === 'others' ? customCollege : college) || "Not specified",
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
        nextAssistantMsg = `Alright, ${clampedNum} round(s) it is.Let's break down Round 1. What type of round was it (e.g. OA, Technical, HR) and what were the main questions or tasks?`;
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
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-transparent pb-2 sm:pb-4">
      <Navbar showThemeToggle={showThemeToggle} />
      {isLoading && <LoadingScreen isDarkMode={isDarkMode} />}

      {/* Warning message for small screens */}
      {isSmallScreen && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mx-4 mt-[80px] flex items-center justify-center gap-2 rounded-[20px] border border-white/60 bg-white/60 px-4 py-3 text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-200 md:hidden">
          <AlertCircle className="h-[18px] w-[18px] text-indigo-500 dark:text-cyan-300" />
          <p className="text-[13px] font-bold tracking-tight">Best experienced on a tablet or laptop.</p>
        </motion.div>
      )}

      <div className={`relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 ${isSmallScreen ? 'mt-4' : 'mt-[100px]'}`}>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl dark:border-slate-700/70 dark:bg-slate-900/70 dark:shadow-[0_14px_36px_rgba(2,6,23,0.65)] sm:rounded-[2.5rem] sm:p-7 md:p-9 lg:p-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-100/40 via-indigo-100/20 to-transparent dark:from-cyan-900/20 dark:via-blue-900/15" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-[80px] dark:bg-cyan-500/15" />
          <div className="pointer-events-none absolute -left-20 top-40 h-64 w-64 rounded-full bg-purple-400/10 blur-[80px] dark:bg-indigo-500/15" />

          <div className="relative mx-auto mb-3 max-w-3xl text-center sm:mb-4">
            <h1 className="mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-[28px] font-extrabold leading-tight tracking-tight text-transparent dark:from-slate-100 dark:via-cyan-300 dark:to-blue-300 sm:mb-3 sm:text-5xl lg:text-6xl">
              {isTale ? "Share Your Story" : "Share Your Journey"}
            </h1>
            <p className="mx-auto px-1 text-[15px] leading-relaxed text-[#111827] dark:text-slate-300 sm:px-0">
              {isTale
                ? "Share your authentic stories from hackathons, general events, projects, and experiences worth sharing—plus the lessons learned along the way."
                : "Help others succeed by sharing your authentic interview insights. Your experience can be the roadmap for someone else's career."}
            </p>
          </div>

          <div className="mb-4 w-full animate-fade-in-up">
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200/65 bg-white/30 px-3 py-2.5 backdrop-blur-md dark:border-slate-700/65 dark:bg-slate-900/35 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 sm:text-[13px]">
                {isTale ? "Fill details below and write your post manually. AI writer is under development for story posts." : "Fill details below, then choose Manual or AI mode."}
              </p>
              <div className="flex items-center gap-2 px-1 sm:px-0">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Auto-saving</p>
              </div>
            </div>
          </div>

          <div className="relative z-[60] mb-6 w-full overflow-visible rounded-2xl border border-slate-200/80 bg-white/35 p-3 backdrop-blur-lg dark:border-slate-700/80 dark:bg-slate-900/45 sm:p-4">
            {isTale && (
              <div className="mb-6 w-full">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <PenLine className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <label className="text-[10.5px] font-bold tracking-normal text-slate-500 uppercase dark:text-slate-400">Story Title</label>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your story a catchy title (e.g., My First Hackathon: A Rollercoaster of Bugs)"
                  className={`w-full rounded-2xl border ${errors.title ? 'border-red-400 bg-red-50/10' : 'border-slate-200 bg-white shadow-sm'} px-5 py-4 text-sm font-semibold text-slate-700 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20`}
                />
                {errors.title && <p className="mt-2 ml-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
              </div>
            )}
            <div className="grid w-full grid-cols-1 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              {/* College */}
              <div className={`group relative z-[56] rounded-xl p-2 transition-all duration-300 ${errors.college ? "border border-red-300/80 bg-transparent dark:border-rose-500/45" : "border border-transparent bg-transparent"}`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileSignature className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                    <label className="text-[10.5px] font-medium tracking-normal text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">College</label>
                  </div>
                  <div className="relative">
                    <SearchableDropdown
                      options={[...colleges, "others"]}
                      value={college}
                      onChange={handleCollegeChange}
                      placeholder="Select College"
                      error={errors.college}
                      remoteSearch
                      loading={collegeLoading}
                      hasMore={collegeHasMore}
                      onSearchTermChange={setCollegeSearchTerm}
                      onLoadMore={() => {
                        if (!collegeLoading && collegeHasMore) {
                          loadColleges(collegeSearchTerm, collegePage + 1);
                        }
                      }}
                    />

                    {college === "others" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className="relative group/input">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                            <GraduationCap size={16} />
                          </div>
                          <input
                            type="text"
                            value={customCollege}
                            onChange={handleCustomCollegeChange}
                            placeholder="Enter your college name..."
                            className="w-full rounded-xl border border-slate-200/60 bg-white/50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/15"
                            autoFocus
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                  {errors.college && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
              </div>

              {/* Batch */}
              <div className={`group relative z-[55] rounded-xl p-2 transition-all duration-300 ${errors.batch ? "border border-red-300/80 bg-transparent dark:border-rose-500/45" : "border border-transparent bg-transparent"}`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                    <label className="text-[10.5px] font-medium tracking-normal text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Batch Year</label>
                  </div>
                  <div className="relative">
                    <SearchableDropdown
                      options={years.map(String)}
                      value={batch ? String(batch) : ""}
                      onChange={(val) => handleBatchChange({ target: { value: val } })}
                      placeholder="Select Year"
                      error={errors.batch}
                    />
                  </div>
                  {errors.batch && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
              </div>

              {/* Department */}
              <div className={`group relative z-[54] rounded-xl p-2 transition-all duration-300 ${errors.branch ? "border border-red-300/80 bg-transparent dark:border-rose-500/45" : "border border-transparent bg-transparent"}`}>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                    <label className="text-[10.5px] font-medium tracking-normal text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">Department</label>
                  </div>
                  <div className="relative">
                    <SearchableDropdown
                      options={branchOptions}
                      value={branch}
                      onChange={(val) => handleBranchChange({ target: { value: val } })}
                      placeholder="Select Dept"
                      error={errors.branch}
                    />
                  </div>
                  {errors.branch && <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</p>}
                </div>
              </div>

              {!isTale ? (
                <>
                  {/* Company */}
                  <div className={`group relative z-[53] rounded-xl p-2 transition-all duration-300 ${errors.company ? "border border-red-300/80 bg-transparent dark:border-rose-500/45" : "border border-transparent bg-transparent"}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                        <label className="text-[10.5px] font-medium tracking-normal text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                          Company
                        </label>
                      </div>
                      <div className="relative">
                        <SearchableDropdown
                          options={companies}
                          value={company}
                          onChange={handleCompanyChange}
                          placeholder="Select Company"
                          error={errors.company}
                          addActionLabel="Add New Company"
                          onAddActionClick={handleAddCompanyAction}
                        />
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
                  <div className={`group relative z-[52] rounded-xl p-2 transition-all duration-300 ${errors.role ? "border border-red-300/80 bg-transparent dark:border-rose-500/45" : "border border-transparent bg-transparent"}`}>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-cyan-300" />
                        <label className="text-[10.5px] font-medium tracking-normal text-slate-500 transition-colors group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200">
                          Role
                        </label>
                      </div>
                      <div className="relative">
                        <SearchableDropdown
                          options={roles}
                          value={role}
                          onChange={handleRoleChange}
                          placeholder="Select Role"
                          error={errors.role}
                        />
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
                </>
              ) : null}
            </div>
          </div>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-white/90 px-6 py-4 shadow-[0_20px_50px_rgba(16,185,129,0.2)] backdrop-blur-xl dark:bg-slate-900/90 dark:text-emerald-300 sm:px-8"
              >
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-emerald-200 sm:text-base">{successMessage}</p>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-white/90 px-6 py-4 shadow-[0_20px_50px_rgba(244,63,94,0.2)] backdrop-blur-xl dark:bg-slate-900/90 dark:text-rose-300 sm:px-8"
              >
                <AlertCircle className="h-6 w-6 text-rose-500" />
                <p className="text-sm font-bold text-slate-900 dark:text-rose-200 sm:text-base">{errorMessage}</p>
                <button onClick={() => setErrorMessage('')} className="ml-2 rounded-lg p-1 hover:bg-rose-500/10 transition-colors">
                  <span className="sr-only">Close</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="w-full pb-4 sm:pb-5">
            <div className="relative mt-2 w-full overflow-visible rounded-[2rem] border border-slate-300/85 bg-white/92 shadow-2xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/88 dark:shadow-[0_18px_44px_rgba(2,6,23,0.72)]">
              <div className="sticky top-4 z-20 w-full rounded-t-[2rem] border-b border-slate-200/70 bg-white/70 p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-3xl transition-all dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_12px_34px_rgba(2,6,23,0.65)] sm:p-3">
                <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/40 p-3 shadow-sm backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/40 md:rounded-2xl sm:p-4">
                  {/* Toggle (Left) */}
                  <div className="flex w-full justify-center">
                    <div className="relative mx-auto flex h-[50px] w-full max-w-[440px] items-center rounded-full border border-slate-300/75 bg-slate-100/80 p-1.5 shadow-inner dark:border-slate-700 dark:bg-slate-800/90 sm:h-[54px]">
                      <button
                        onClick={() => handleModeChange('manual')}
                        className={`relative z-10 flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors duration-300 sm:text-sm ${mode === 'manual' ? 'text-blue-700 dark:text-cyan-200' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                      >
                        <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Manual Writer
                      </button>
                      <button
                        onClick={() => handleModeChange('ai')}
                        className={`relative z-10 flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-[13px] font-bold transition-colors duration-300 sm:text-sm ${mode === 'ai' ? 'text-indigo-700 dark:text-cyan-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} ${isTale ? 'opacity-60' : ''}`}
                      >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {isTale ? "AI Under Dev" : "AI Assistant"}
                      </button>

                      {/* Animated pill background */}
                      <div
                        className={`absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 shadow-[0_10px_24px_rgba(15,23,42,0.16)] transition-all duration-300 ease-out dark:from-cyan-950/70 dark:to-blue-950/65 dark:bg-slate-950 ${mode === 'manual' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                        style={{
                          border: mode === 'ai' ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid rgba(37, 99, 235, 0.45)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex w-full flex-row flex-wrap items-center justify-start gap-3 border-t border-slate-200/70 pt-3 sm:gap-4 sm:justify-end dark:border-slate-700/80">
                    {/* Copy template button */}
                    <div className={`hidden sm:flex transition-all duration-300 transform-gpu ${mode !== 'manual' ? 'pointer-events-none opacity-0 w-0 -mx-2 overflow-hidden scale-95' : 'opacity-100 w-auto scale-100'}`}>
                      <button
                        type="button"
                        onClick={handleCopyTemplate}
                        className="group flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-2.5 text-[13px] font-bold text-blue-700 transition-all hover:-translate-y-0.5 hover:bg-blue-100 hover:text-blue-800 dark:border-cyan-500/35 dark:bg-cyan-950/35 dark:text-cyan-300 dark:hover:bg-cyan-950/50 dark:hover:text-cyan-200 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
                      >
                        Template <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                      </button>
                    </div>

                    <div className="flex w-full items-center justify-center gap-2.5 sm:gap-3 sm:w-auto">
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
                </div>
              </div>
              <div className="w-full">

                {/* AI Prompt Area */}
                {mode === 'ai' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full min-h-[600px] w-full flex-col bg-slate-50/65 dark:bg-slate-950/85"
                  >
                    {/* Chat header */}
                    <div className="flex items-center justify-between border-b border-indigo-100/50 bg-white/85 px-6 py-5 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 shadow-inner dark:border-cyan-500/35 dark:from-cyan-950/50 dark:to-blue-950/50 dark:text-cyan-300">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Experience AI Guide</h3>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">I'll help structure your journey flawlessly</p>
                        </div>
                      </div>
                    </div>

                    {/* Chat messages area */}
                    <div ref={chatContainerRef} className="flex min-h-[400px] flex-1 flex-col gap-6 overflow-y-auto rounded-b-xl bg-[url('/grid-bg.svg')] bg-center p-4 dark:bg-slate-900/65 sm:p-8">
                      {chatMessages.map((msg, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          key={index}
                          className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {msg.role !== 'user' && (
                            <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm dark:border-cyan-500/35 dark:from-cyan-950/50 dark:to-blue-950/50">
                              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-2xl px-6 py-4 shadow-sm sm:max-w-[75%] ${msg.role === 'user' ? 'rounded-br-sm bg-indigo-600 text-white dark:bg-cyan-600 dark:text-slate-950' : 'rounded-bl-sm border border-slate-200/75 bg-white text-slate-800 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-100'}`}>
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
                          <div className="mr-3 mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-100 to-indigo-100 shadow-sm dark:border-cyan-500/35 dark:from-cyan-950/50 dark:to-blue-950/50">
                            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-cyan-300" />
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-slate-200/70 bg-white px-6 py-4 shadow-sm dark:border-slate-600 dark:bg-slate-800/95">
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
                    <div className="rounded-b-[2rem] border-t border-slate-200/80 bg-white/92 p-4 backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:p-6">
                      <form onSubmit={handleSendChatMessage} className="relative mx-auto flex w-full max-w-4xl gap-3 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          disabled={isGenerating || chatStage === 'generating' || chatStage === 'done'}
                          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 pr-14 text-[15px] font-medium text-slate-800 shadow-inner transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-500/20"
                          placeholder={chatStage === 'generating' || chatStage === 'done' ? "✨ Generating your perfect experience post..." : "Type your answer here..."}
                        />
                        <button
                          type="submit"
                          disabled={!chatInput.trim() || isGenerating || chatStage === 'generating' || chatStage === 'done'}
                          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-blue-600 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
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
                    onError={handleEditorError}
                    minHeight={650}
                  />
                </div>
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
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSuccess={handleAddCompanySuccess}
        initialName={newCompanyInitialName}
      />
    </div>
  );
}
