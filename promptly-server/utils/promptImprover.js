import OpenAI from "openai";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

/**
 * Improve a user's raw input using Gemini to produce better AI output.
 * Only the user's topic/description is improved — task instructions are added separately.
 * @param {string} userInput - The raw user input (topic, keyword, description)
 * @param {string} taskType - The type of task (e.g., "blog-title", "article", "image")
 * @returns {string} - The improved user input
 */
export async function improvePrompt(userInput, taskType = "general") {
  const taskHints = {
    "blog-title": "The user wants to generate blog titles. Improve their keyword/topic to produce more creative and SEO-friendly blog titles.",
    "article": "The user wants to write an article. Improve their topic description to produce a more focused, detailed, and engaging article.",
    "image": "The user wants to generate an image. Improve their description to be more vivid, detailed, and visually descriptive for image generation.",
    "general": "Improve the following input to be more specific, detailed, and effective.",
  };

  const hint = taskHints[taskType] || taskHints["general"];

  try {
    const response = await AI.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: `You are a prompt engineering expert. ${hint}\n\nImprove the following user input. Only return the improved version of the input itself — do NOT include any instructions, prefixes, or explanations. Just the enhanced topic/description.\n\nUser input: "${userInput}"`,
        },
      ],
      temperature: 0.5,
      max_tokens: 300,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.log("[Prompt Improver] Error, using original input:", error.message);
    return userInput; // Fallback to original on error
  }
}
