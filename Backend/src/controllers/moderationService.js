// moderation helper
import fetch from "node-fetch";

export async function classifyReviewWithLLM(reviewText) {
  try {
    const prompt = `
You are an AI content-moderation assistant for a real estate website.

Your job is to detect whether a user’s review is appropriate or inappropriate.

OUTPUT FORMAT (STRICT):
{
  "isAbusive": true/false,
  "category": "abusive | harmful | inappropriate | hate | violent | safe",
  "reason": "short explanation"
}

RULES:
- Even ONE harmful or abusive word → isAbusive: true.
- Only check for safety, NOT positivity.
- Return ONLY JSON. No extra words.

INPUT:
"${reviewText}"
    `;

    // choose llm endpoint
    const baseUrl = process.env.GROQ_API_URL || process.env.LLM_API_URL;

    if (!baseUrl) throw new Error("LLM API URL not configured set GROQ_API_URL or LLM_API_URL");

    const url = baseUrl;

    // set headers
    const headers = { "Content-Type": "application/json" };

    if (process.env.GROQ_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.GROQ_API_KEY}`;
      console.log("Using GROQ API key for LLM requests");
    } else if (process.env.LLM_API_KEY) {
      // fallback header
      headers["Authorization"] = `Bearer ${process.env.LLM_API_KEY}`;
      console.log("Using LLM_API_KEY for LLM requests");
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();
    console.log("GEMINI RAW RESPONSE:", data);

    // check llm payload
    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content ||
      !data.candidates[0].content.parts ||
      !data.candidates[0].content.parts[0].text
    ) {
      throw new Error("Invalid LLM response format");
    }

    const llmOutput = data.candidates[0].content.parts[0].text;
    return JSON.parse(llmOutput);

  } catch (error) {
    console.error("LLM ERROR:", error);
    return {
      isAbusive: false,
      category: "safe",
      reason: "LLM failed, default safe"
    };
  }
}
