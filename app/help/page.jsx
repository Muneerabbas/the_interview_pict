"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Navbar from "../../components/Navbar";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function HelpPage() {
  const [markdown, setMarkdown] = useState(`
## 🚀 Interview Experience Template

Welcome to your Interview Experience Guide! This template is here to help you share your journey in a way that’s informative and exciting. Feel free to customize it as you wish and help future aspirants!

---

### 1. 🏢 **Company & Role**

*   **Company:** [Company Name] (e.g., Google, Microsoft, Startup X)
*   **Role:** [Job Title] (e.g., SDE Intern, Software Engineer, Data Scientist)
*   **Batch/Year of Graduation:** [Your Graduation Year] (e.g., 2024, 2023)
*   **Branch:** [Your Branch of Engineering] (e.g., Computer Science, IT, Electronics)

---

### 2. 📅 **Application Process**

*   **How did you apply?** (e.g., LinkedIn, Company Website, Referral, On-Campus)
*   **Timeline:**
    *   **Application Date:** [Date]
    *   **Online Assessment Date:** [Date] (if applicable)
    *   **Interview Dates:** [Date(s)]
    *   **Offer Date:** [Date] (if applicable)

---

### 3. 💬 **Interview Rounds**

#### Round 1: [Round Name] (e.g., Online Assessment, Technical Interview 1)
*   **Type:** [e.g., Coding, MCQ, Technical, HR]
*   **Description:** [Detailed description of the round. What kind of questions were asked? Coding problems, DSA concepts, System Design, Behavioral questions etc.]
    *   **Example Questions:**
        1.  [Question 1] 👨‍💻
        2.  [Question 2] 🧠
        3.  [Question 3] 🔥
*   **Difficulty Level:** [Easy, Medium, Hard]
*   **Your Experience:** [How did you perform? What was challenging? Tips for this round?]

#### Round 2: [Round Name] (e.g., Technical Interview 2, HR Round)
*   **Type:** [e.g., Coding, Technical, HR, Managerial]
*   **Description:** [Detailed description of the round]
    *   **Example Questions:**
        1.  [Question 1] 🔍
        2.  [Question 2] 💡
*   **Difficulty Level:** [Easy, Medium, Hard]
*   **Your Experience:** [Your performance and tips]

#### Round 3 (and subsequent rounds if any):

*   [Follow the same format as above for each round.]

---

### 4. 📊 **Overall Experience & Tips**

*   **Overall Interview Experience:** [How was your overall experience with the company? Positive, negative, or neutral?]
*   **What to prepare?** 💯 [List of topics to prepare for this company and role, e.g., DSA, System Design, specific technologies, behavioral questions.]
*   **Tips for Aspirants:** ✨ [Any general tips or advice for future candidates? Share your golden nuggets!]
*   **Verdict:** [Selected/Rejected/Waiting] (Optional)

---

### 5. 🖼️ **Add Images!**
![image](https://i.imgflip.com/9jbjc6.jpg)

Feel free to upload any image that showcases your interview experience—perhaps a photo of the company’s office or your work environment. Visuals help make your experience even more relatable!

---

### 6. 📝 **Additional Comments (Optional)**

*   [Any other information you want to share, e.g., interviewer feedback, company culture insights, salary discussions, etc.]

---

### 💡 **Code Snippet Examples (Optional)**

Here’s an example of a coding question you could include in your experience. Feel free to add some code snippets to demonstrate your problem-solving skills!

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

Good Luck, and Remember: Stay Confident! 😎

**Note:** Be as detailed as possible, and don’t forget to replace the bracketed placeholders with your actual interview details. The more info you provide, the more helpful your experience will be to others. 🙌
`);
  const [height, setHeight] = useState("calc(100vh)");
  const [bottomMargin, setBottomMargin] = useState("0px");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const messageTimeout = useRef(null); // Ref to hold the timeout

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsSmallScreen(window.innerWidth < 768);
        setBottomMargin(window.innerWidth < 768 ? "80px" : "0px");
        setHeight(window.innerWidth < 768 ? "calc(100vh - 50px)" : "calc(100vh)");
      };

      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyMessage("Template has been copied!");

      // Clear any existing timeout
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }

      // Set timeout to clear the message after 2 seconds
      messageTimeout.current = setTimeout(() => {
        setCopyMessage("");
      }, 2000);

    } catch (err) {
      console.error("Failed to copy text: ", err);
      setCopyMessage("Copy failed. Please try again.");
       // Clear any existing timeout
       if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
      messageTimeout.current = setTimeout(() => {
        setCopyMessage("");
      }, 2000);
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">Help & Template</h1>
          <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2 text-center">
            <span className="text-red-500">*</span> This is just a template. You cannot edit here. <span className="text-red-500">*</span>
          </p>
          <p className="text-slate-600 dark:text-slate-300 mb-4 text-center">
            To use this template, <strong className="underline">copy</strong> the content below and <strong className="underline">paste</strong> it into the Post section to share your experience.
          </p>

          <div className="flex justify-end mb-2"> {/* Container for copy button, aligned to right */}
            <button
              onClick={handleCopyClick}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Copy Template Text
            </button>
          </div>

          {/* Editor Container with fixed height */}
          <div
            className="rounded-lg overflow-hidden relative"
            style={{
              height: height,
              marginBottom: bottomMargin,
              minHeight: '100%',
            }}
          >
            {/* Markdown Editor with Scrollable Content - Read Only */}
            <div className="relative w-full h-full overflow-hidden">
              <div className="w-full h-full overflow-y-auto">
                <MDEditor
                  value={markdown}
                  preview="live"
                  hideToolbar={true}  /* Hide toolbar to further discourage editing */
                  data-color-mode="light"
                  className="w-full h-full read-only-editor" /* Added custom class for read-only styling if needed */
                  height="100%"
                  readOnly={true}      /* Make the editor read-only */
                />
              </div>
              <div className="mb-[800px]"></div> {/* Keep this for scroll, adjust if needed */}
            </div>
          </div>

          {/* Floating copy message */}
          {copyMessage && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-md shadow-lg animate-slide-in-right pointer-events-none">
              {copyMessage}
            </div>
          )}

        </div>
      </div>
       {/* Style for animation - Add to global styles or CSS file */}
       <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
