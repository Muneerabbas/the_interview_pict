import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
    try {
        const { data } = await req.json();
        console.log(data)
        const prompt = `
You are given raw interview experience data written by a student.

Your job:
- Fix grammar and sentence structure
- Make it sound natural and human-written
- Keep it simple and realistic (like a student wrote it)
- Do NOT add any new information
- Do NOT change company, role, or facts
- Do NOT exaggerate or make it fancy
- Keep the tone casual and genuine

Return clean markdown (no code block).

DATA:
${JSON.stringify(data, null, 2)}

FORMAT:

# 📌 Interview Experience – ${data.company} | ${data.role}

**🎓 Batch:** ${data.batch} | **🏫 Branch:** ${data.branch} | **🔄 Total Rounds:** ${data.rounds}

---

### 🔹 Shortlisting Criteria
Rewrite this naturally:
${data.shortlisting}

### ⏱️ Interview Rounds Breakdown
Rewrite these rounds naturally, separating them clearly (e.g., 🧪 Round 1: Online Assessment, 🧠 Round 2: Technical, 🧑💼 Round 3: HR). Keep the student's exact questions and experiences intact:
${data.topics}

### ✅ Final Verdict & Tips
Rewrite this naturally in a supportive tone:
${data.verdictAndTips}
`;

        // const response = await ai.models.generateContent({
        //     model: "gemini-2.5-pro",
        //     contents: prompt,
        // });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
            }
        });
        console.log(response)
        return Response.json({
            text: response.text,
        });

    } catch (err) {
        console.error(err);
        return Response.json({ error: "Failed" }, { status: 500 });
    }
}