import OpenAI from "openai";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/**
 * Improve a user prompt using Gemini to produce better AI output.
 * @param {string} prompt - The original user prompt
 * @returns {string} - The improved prompt
 */
export async function improvePrompt(prompt) {
  try {
    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: `You are a prompt engineering expert. Rewrite and improve the following prompt to produce better, more detailed, and more specific AI output. Only return the improved prompt, nothing else.\n\nOriginal prompt: "${prompt}"`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.log("[Prompt Improver] Error, using original prompt:", error.message);
    return prompt; // Fallback to original on error
  }
}
