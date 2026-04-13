import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import { checkFreeLimit, incrementFreeUsage } from "../middleware/auth.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'
import { improvePrompt } from "../utils/promptImprover.js";

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const GEMINI_MODEL = "gemini-2.5-flash";

// ─── Map client length value to prompt spec ──────────────────────────────
const ARTICLE_LENGTH_MAP = {
  800:  { maxTokens: 1500, instruction: 'Short: write between 500 and 800 words. Do not stop before 500 words.' },
  1200: { maxTokens: 2500, instruction: 'Medium: write between 800 and 1200 words. Do not stop before 800 words.' },
  1600: { maxTokens: 4000, instruction: 'Long: write a minimum of 1200 words. Do not stop before 1200 words.' },
};

// ─── Write Article ────────────────────────────────────────────────────────

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { topic, length, improvePromptFlag } = req.body;

    if (!(await checkFreeLimit(req, res, 'article'))) return;

    const spec = ARTICLE_LENGTH_MAP[length] || ARTICLE_LENGTH_MAP[800];

    const finalTopic = improvePromptFlag ? await improvePrompt(topic, "article") : topic;

    const prompt = `Write a complete, well-structured article on the topic: '${finalTopic}'.

Length requirement (strictly enforced):
- ${spec.instruction}

Formatting rules:
- Use # markdown for the article title
- Use ## markdown for all subheadings
- Write in clear, engaging paragraphs
- Do not truncate or end mid-sentence
- Do not include a word count note at the end`;

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: "You are a professional content writer. Write high-quality articles with proper structure, headings, and formatting in markdown. Always write the full article — never cut it short." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: spec.maxTokens,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${topic}, ${content}, 'article', ${topic})`;
    await incrementFreeUsage(req, 'article');

    res.json({ success: true, content });
  } catch (err) {
    console.error('[WriteArticle] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: err?.response?.data?.error?.message || 'Generation failed. Please try again.' });
  }
};

// ─── Blog Titles ──────────────────────────────────────────────────────────

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { keyword, category, improvePromptFlag } = req.body;

    if (!(await checkFreeLimit(req, res, 'blog-title'))) return;

    const finalKeyword = improvePromptFlag ? await improvePrompt(keyword, "blog-title") : keyword;

    const prompt = `Generate exactly 8 creative, SEO-optimized blog post titles.
Keyword: '${finalKeyword}'
Category: ${category || "General"}

Rules:
- Return ONLY a numbered list from 1 to 8
- One title per line
- Exactly 8 titles — not fewer, not more
- No intro text, no commentary, no extra lines
- Each title must be unique, specific, and compelling`;

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        { role: "system", content: "You are a professional blog title generator. Generate creative, SEO-optimized blog titles. Only return the titles as a numbered list, nothing else." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 768,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${keyword}, ${content}, 'blog-title', ${keyword})`;
    await incrementFreeUsage(req, 'blog-title');

    res.json({ success: true, content });
  } catch (err) {
    console.error('[BlogTitles] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: err?.response?.data?.error?.message || 'Generation failed. Please try again.' });
  }
};

// ─── Generate Image (HuggingFace FLUX.1) ──────────────────────────────────

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { description, style, publish, improvePromptFlag } = req.body;

    if (!(await checkFreeLimit(req, res, 'image'))) return;

    const finalDescription = improvePromptFlag ? await improvePrompt(description, "image") : description;

    const imagePrompt = `${finalDescription}, ${style || "Realistic"} style`;

    const { data } = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      { inputs: imagePrompt },
      {
        headers: { 
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "image/jpeg"
        },
        responseType: "arraybuffer"
      }
    );

    const base64Image = `data:image/jpeg;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: "promptly_ai"
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish, original_prompt) VALUES (${userId}, ${description}, ${secure_url}, 'image', ${
      publish ?? false
    }, ${description})`;
    await incrementFreeUsage(req, 'image');

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error("[Image Gen Error]", error?.response?.status, error?.response?.data || error.message);
    
    if (error?.response?.status === 503) {
      return res.json({ success: false, message: "Model is currently loading. Please try again in 30 seconds." });
    }
    if (error?.response?.status === 429) {
      return res.json({ success: false, message: "HuggingFace rate limit reached. Please wait a few minutes." });
    }
    
    res.status(500).json({ success: false, message: "Image generation failed. Please try again." });
  }
};

// ─── Remove Background ───────────────────────────────────────────────────

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const  image  = req.file;

    if (!(await checkFreeLimit(req, res, 'remove-bg'))) return;

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [{ effect: "background_removal", backgroud_removal: "remove_the_background" }],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image', 'Remove background from image')`;
    await incrementFreeUsage(req, 'remove-bg');

    res.json({ success: true, content: secure_url });
  } catch (err) {
    console.error('[RemoveBackground] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: 'Background removal failed. Please try again.' });
  }
};

// ─── Remove Object ────────────────────────────────────────────────────────

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const  image  = req.file;

    if (!(await checkFreeLimit(req, res, 'remove-object'))) return;

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
        transformation:[{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })

    const promptText = `Removed ${object} from image`;
    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${promptText}, ${imageUrl}, 'image', ${promptText})`;
    await incrementFreeUsage(req, 'remove-object');

    res.json({ success: true, content: imageUrl });
  } catch (err) {
    console.error('[RemoveObject] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: 'Object removal failed. Please try again.' });
  }
};

// ─── Resume Review ────────────────────────────────────────────────────────

export const resumeReview = async (req, res) => {
    try {
      const { userId } = req.auth();
      const resume = req.file;
      const plan = req.plan;
  
      if (plan !== "premium") {
        return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
      }
  
      if(resume.size > 5 * 1024 *1024){
        return res.json({success: false, message: "Resume file size exceeds allows size (5MB)."})
      }

      const dataBuffer = fs.readFileSync(resume.path)
      const pdfData = await pdf(dataBuffer)

      const prompt = `You are an expert career coach and resume reviewer. Analyze the following resume content thoroughly and provide a comprehensive review.

Resume content:
${pdfData.text}

Provide your review in this exact structure using ## markdown headings:

## Overall Score
Give a score out of 10 with a one-sentence justification.

## Strengths
List 3–5 specific strengths found in this resume with bullet points.

## Areas for Improvement
List 4–6 specific, actionable improvements with bullet points. Be direct.

## Content & Clarity
Assess how clearly the candidate's experience and skills are communicated.

## ATS Optimization
Identify any keywords or formatting issues that could hurt ATS scoring.

## Formatting & Structure
Comment on layout, length, and visual organization.

## Rewritten Summary
Rewrite the professional summary/objective section to be stronger.

## Final Recommendation
One paragraph with your overall recommendation and top 3 next steps.

Be specific, honest, and actionable. Do not give generic advice.`

      const response = await AI.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          { role: "system", content: "You are a professional resume reviewer and career coach. Provide detailed, constructive feedback on resumes with specific actionable suggestions for improvement. Format your response in clear sections using markdown." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
  
      const content = response.choices[0].message.content;
  
      await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review', 'Review the uploaded resume')`;
  
      res.json({ success: true, content });
    } catch (err) {
      console.error('[ResumeReview] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
      res.status(500).json({ success: false, message: err?.response?.data?.error?.message || 'Generation failed. Please try again.' });
    }
  };

// ─── Regenerate a previous creation ─────────────────────────────────────

export const regenerateCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { creationId } = req.body;

    const [original] = await sql`SELECT * FROM creations WHERE id = ${creationId} AND user_id = ${userId}`;
    if (!original) {
      return res.json({ success: false, message: "Creation not found" });
    }

    // Resume review is always premium-only
    if (req.plan !== "premium" && original.type === 'resume-review') {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    // Check per-feature daily limit for free users
    const featureKey = original.type; // 'article', 'blog-title', or 'image'
    if (!(await checkFreeLimit(req, res, featureKey))) return;

    const rootId = original.parent_id || original.id;
    const [maxVersionRow] = await sql`SELECT COALESCE(MAX(version), 0) as max_version FROM creations WHERE (id = ${rootId} OR parent_id = ${rootId}) AND user_id = ${userId}`;
    const newVersion = (maxVersionRow.max_version || 1) + 1;

    const originalPrompt = original.original_prompt || original.prompt;
    let content;

    if (original.type === 'article' || original.type === 'blog-title' || original.type === 'resume-review') {
      let systemMsg, userMsg, maxTokens;
      if (original.type === 'article') {
        systemMsg = "You are a professional content writer. Write high-quality articles with proper structure, headings, and formatting in markdown. Always write the full article — never cut it short.";
        userMsg = `Write a complete, well-structured article on the topic: '${originalPrompt}'.

Length requirement (strictly enforced):
- Medium: write between 800 and 1200 words. Do not stop before 800 words.

Formatting rules:
- Use # markdown for the article title
- Use ## markdown for all subheadings
- Write in clear, engaging paragraphs
- Do not truncate or end mid-sentence
- Do not include a word count note at the end`;
        maxTokens = 2500;
      } else if (original.type === 'blog-title') {
        systemMsg = "You are a professional blog title generator. Generate creative, SEO-optimized blog titles. Only return the titles as a numbered list, nothing else.";
        userMsg = `Generate exactly 8 creative, SEO-optimized blog post titles.
Keyword: '${originalPrompt}'

Rules:
- Return ONLY a numbered list from 1 to 8
- One title per line
- Exactly 8 titles — not fewer, not more
- No intro text, no commentary, no extra lines
- Each title must be unique, specific, and compelling`;
        maxTokens = 768;
      } else {
        systemMsg = "You are a professional resume reviewer. Provide detailed, constructive feedback with actionable suggestions in markdown.";
        userMsg = originalPrompt;
        maxTokens = 2000;
      }

      const response = await AI.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userMsg },
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
      });
      content = response.choices[0].message.content;
    } else if (original.type === 'image') {
      const { data } = await axios.post(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        { inputs: originalPrompt },
        {
          headers: { 
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "image/jpeg"
          },
          responseType: "arraybuffer"
        }
      );
      const base64Image = `data:image/jpeg;base64,${Buffer.from(data, "binary").toString("base64")}`;
      const { secure_url } = await cloudinary.uploader.upload(base64Image, {
        folder: "promptly_ai"
      });
      content = secure_url;
    }

    await sql`INSERT INTO creations (user_id, prompt, content, type, original_prompt, version, parent_id, publish) 
              VALUES (${userId}, ${originalPrompt}, ${content}, ${original.type}, ${originalPrompt}, ${newVersion}, ${rootId}, false)`;

    await incrementFreeUsage(req, featureKey);

    res.json({ success: true, content, version: newVersion });
  } catch (err) {
    console.error('[Regenerate] Full error:', JSON.stringify(err?.response?.data || err?.message || err));
    res.status(500).json({ success: false, message: err?.response?.data?.error?.message || 'Generation failed. Please try again.' });
  }
};