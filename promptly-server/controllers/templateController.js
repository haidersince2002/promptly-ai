import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const GEMINI_MODEL = "gemini-2.5-flash";

// Get all templates
export const getTemplates = async (req, res) => {
  try {
    const templates = await sql`SELECT * FROM templates ORDER BY created_at DESC`;
    res.json({ success: true, templates });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get template by ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const [template] = await sql`SELECT * FROM templates WHERE id = ${id}`;
    if (!template) {
      return res.json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, template });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Generate content from a filled template
export const generateFromTemplate = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { templateId, filledPrompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [{ role: "user", content: filledPrompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type, original_prompt) 
              VALUES (${userId}, ${filledPrompt}, ${content}, 'template', ${filledPrompt})`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
