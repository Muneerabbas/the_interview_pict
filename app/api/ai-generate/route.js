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

# 🏢 ${data.company} Interview Experience | 👨‍💻 ${data.role}

**🎓 Batch:** ${data.batch} | **🏫 Branch:** ${data.branch} | **🔄 Rounds:** ${data.rounds}

---

### 📝 Application Process
Rewrite this naturally:
${data.application}

### 💻 Interview Rounds
Rewrite this naturally:
${data.topics}

### 📊 Overall Difficulty
Rewrite this naturally in one line:
${data.difficulty}

### 💡 Experience & Tips
Rewrite this naturally:
${data.tips}
`;

        // const response = await ai.models.generateContent({
        //     model: "gemini-2.5-pro",
        //     contents: prompt,
        // });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                temperature: 0.3,
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