import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const GEMINI_MODEL = "gemini-2.0-flash";

// ─── Per-template prompt builders and max_tokens ────────────────────────

const TEMPLATE_CONFIG = {
  "LinkedIn Post Generator": {
    maxTokens: 2500,
    buildPrompt: (fields) => `Write a complete, engaging LinkedIn post.
Topic: '${fields.topic || ''}'
Tone: ${fields.tone || 'professional'}
Required word count: exactly ${fields.length || 200} words. You must reach ${fields.length || 200} words.
Do not stop writing before ${fields.length || 200} words are complete.

Structure:
- Start with a strong hook (first line must grab attention)
- Develop 3–4 key insights or points in the body
- End with a clear call-to-action
- Add 3–5 relevant hashtags on the final line

Write the complete post. Do not truncate.`,
  },
  "Startup Pitch Generator": {
    maxTokens: 2500,
    buildPrompt: (fields) => `Write a complete, investor-ready startup pitch.
Description: ${fields.description || ''}
Target Audience: ${fields.audience || ''}
Key Differentiator: ${fields.differentiator || ''}

Use these exact ## markdown sections in this order:
## The Problem
## Our Solution
## Target Market
## Key Differentiator
## Business Model
## The Ask

Requirements:
- Each section must have at least 3 substantive sentences
- Use confident, compelling language
- Make it specific to the description provided
- Do not skip any section. Do not truncate.`,
  },
  "Product Description Generator": {
    maxTokens: 1500,
    buildPrompt: (fields) => `Write a persuasive, conversion-optimized product description.
Product Name: ${fields.product_name || fields.productName || ''}
Features: ${fields.features || ''}
Target Customer: ${fields.target || ''}
Tone: ${fields.tone || 'professional'}

Structure:
- # Compelling product headline
- Opening paragraph (2–3 sentences, hook the reader)
- Key features and benefits as markdown bullet points
- Closing paragraph with a strong call-to-action

Do not truncate. Write the complete description.`,
  },
  "Email Reply Generator": {
    maxTokens: 1200,
    buildPrompt: (fields) => `Write a complete, professional email reply.

Original email to reply to:
${fields.original_email || ''}

Tone: ${fields.tone || 'professional'}
Key points to address: ${fields.key_points || ''}

Requirements:
- Start with an appropriate greeting
- Address every single key point mentioned
- Maintain the specified tone throughout
- End with a professional closing and sign-off
- Write the complete email — do not truncate`,
  },
  "Blog Outline Generator": {
    maxTokens: 2000,
    buildPrompt: (fields) => `Create a detailed blog post outline.
Topic: '${fields.topic || ''}'
Target Audience: ${fields.audience || ''}
Number of sections required: exactly ${fields.num_sections || 5}

Format using markdown:
# [Suggested compelling blog title]

## Introduction
- What this article covers (2–3 bullet points)

## [Section 1 Title]
- Sub-point 1
- Sub-point 2
- Sub-point 3

[Continue for ALL ${fields.num_sections || 5} sections — not one more, not one fewer]

## Conclusion
- Key takeaways (2–3 bullet points)

Rules:
- Every section must have exactly 3–4 bullet sub-points
- Section titles must be specific and relevant to ${fields.topic || 'the topic'}
- You must include exactly ${fields.num_sections || 5} main sections between Introduction and Conclusion`,
  },
  "Social Media Caption": {
    maxTokens: 600,
    buildPrompt: (fields) => `Write a social media caption for ${fields.platform || 'Instagram'}.
Topic: '${fields.topic || ''}'
Tone: ${fields.tone || 'casual'}
Maximum character limit: ${fields.max_length || 280} characters

CRITICAL: The entire caption including hashtags must NOT exceed ${fields.max_length || 280} characters. This is a hard limit. Count carefully.

Include:
- Engaging opening line
- Core message
- Call-to-action or engagement question
- Relevant hashtags for ${fields.platform || 'Instagram'}

Output ONLY the caption text. No commentary. No character count note.`,
  },
};

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
    const { templateId, filledPrompt, fields } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    // Fetch template to determine type
    const [template] = await sql`SELECT * FROM templates WHERE id = ${templateId}`;
    const templateTitle = template?.title || '';

    // Find matching config or fall back to generic
    const config = TEMPLATE_CONFIG[templateTitle];
    let prompt, maxTokens;

    if (config && fields) {
      prompt = config.buildPrompt(fields);
      maxTokens = config.maxTokens;
    } else {
      // Fallback: use the filled prompt from client
      prompt = filledPrompt;
      maxTokens = 1500;
    }

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: "You are a professional content writer. Follow the user's instructions exactly. Format output in markdown. Produce complete, well-structured content — never truncate." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type, original_prompt) 
              VALUES (${userId}, ${prompt}, ${content}, 'template', ${prompt})`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (err) {
    console.error('[Template] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: err?.response?.data?.error?.message || 'Generation failed. Please try again.' });
  }
};
