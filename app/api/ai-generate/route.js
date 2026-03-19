import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
    try {
        const { data } = await req.json();
        const isSkipped = (value) => {
            if (!value) return true;
            const normalized = String(value).trim().toLowerCase();
            return normalized === "skip" || normalized === "skipped" || normalized === "na" || normalized === "n/a";
        };

        const includeOfferDetails = !isSkipped(data.offerDetails);

        const prompt = `
You are an editor that converts raw interview notes into a highly useful, realistic post for students preparing for placements.

Non-negotiable rules:
- Keep all facts exactly as provided. Do not invent details.
- Improve grammar, structure, and readability.
- Keep tone practical, student-friendly, and genuine (not corporate/fancy).
- Use concise bullets where they improve clarity.
- Add relevant emojis in headings and key bullets to make it engaging, but keep usage light and professional (no spam).
- If a section has missing/weak input, keep it short and avoid hallucination.
- Preserve company, role, batch, branch, and round count details.

Return clean markdown (no code block).

DATA:
${JSON.stringify(data, null, 2)}

FORMAT:

# Interview Experience – ${data.company} | ${data.role}

**Batch:** ${data.batch} | **Branch:** ${data.branch} | **Total Rounds:** ${data.rounds}

---

## Process Snapshot
- **Eligibility / Shortlisting:** ${data.eligibility || data.shortlisting || "Not shared"}
- **Application Route & Timeline Start:** ${data.applicationRoute || "Not shared"}

## Round-by-Round Breakdown
Rewrite the rounds clearly and naturally. Keep each round separate and actionable.
${data.topics || "Not shared"}

## Difficulty, Topics, and Interview Focus
- **Difficulty Across Rounds:** ${data.difficulty || "Not shared"}
- **Most Asked Topics:** ${data.keyTopics || "Not shared"}
- **What Interviewers Focused On:** ${data.interviewFocus || "Not shared"}

## Coding and Project Discussion
- **Coding Question Patterns / Constraints / Expected Approach:** ${data.codingSpecifics || "Not shared"}
- **Project Deep-Dive (architecture, trade-offs, scaling, debugging):** ${data.projectDeepDive || "Not shared"}

## HR and Behavioral
- **HR/Behavioral Questions:** ${data.hrBehavioral || "Not shared"}
- **Unexpected/Tricky Moments + Handling:** ${data.unexpected || "Not shared"}

## Final Outcome
- **Verdict:** Extract from this text and present cleanly: ${data.verdictAndTips || "Not shared"}
- **Top Tips for Juniors:** Extract actionable points from the same text.

## Mistakes to Avoid
${data.mistakesToAvoid || "Not shared"}

## Preparation Strategy
- **What Helped Most (resources/mocks/plan):** ${data.prepStrategy || "Not shared"}
- **7-Day Priority Plan for Juniors:** ${data.sevenDayPlan || "Not shared"}

${includeOfferDetails ? `## Optional Offer Details
${data.offerDetails}` : ""}

## Quick Preparation Checklist
End with a short checklist (5-8 bullets) titled exactly "### Quick Checklist for Students" based ONLY on the provided data.
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
        return Response.json({
            text: response.text,
        });

    } catch (err) {
        console.error(err);
        return Response.json({ error: "Failed" }, { status: 500 });
    }
}