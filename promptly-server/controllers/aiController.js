import OpenAI from "openai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
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

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length, improvePromptFlag } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const originalPrompt = prompt;
    const finalPrompt = improvePromptFlag ? await improvePrompt(prompt) : prompt;

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${finalPrompt}, ${content}, 'article', ${originalPrompt})`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, improvePromptFlag } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    const originalPrompt = prompt;
    const finalPrompt = improvePromptFlag ? await improvePrompt(prompt) : prompt;

    const response = await AI.chat.completions.create({
      model: GEMINI_MODEL,
      messages: [
        {
          role: "user",
          content: finalPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${finalPrompt}, ${content}, 'blog-title', ${originalPrompt})`;
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish, improvePromptFlag } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const originalPrompt = prompt;
    const finalPrompt = improvePromptFlag ? await improvePrompt(prompt) : prompt;

    // Call HuggingFace FLUX.1 API
    const { data } = await axios.post(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
      { inputs: finalPrompt },
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

    await sql` INSERT INTO creations (user_id, prompt, content, type, publish, original_prompt) VALUES (${userId}, ${finalPrompt}, ${secure_url}, 'image', ${
      publish ?? false
    }, ${originalPrompt})`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("[Image Gen Error]", error?.response?.status, error?.response?.data || error.message);
    
    // Check for HuggingFace quota/model loading errors
    if (error?.response?.status === 503) {
      return res.json({ success: false, message: "Model is currently loading. Please try again in 30 seconds." });
    }
    if (error?.response?.status === 429) {
      return res.json({ success: false, message: "HuggingFace rate limit reached. Please wait a few minutes." });
    }
    
    res.json({ success: false, message: "Image generation failed. Please try again." });
  }
};

export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const  image  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          backgroud_removal: "remove_the_background",
        },
      ],
    });

    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image', 'Remove background from image')`;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const  image  = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
        transformation:[{effect: `gen_remove:${object}`}],
        resource_type: 'image'
    })

    const promptText = `Removed ${object} from image`;
    await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, ${promptText}, ${imageUrl}, 'image', ${promptText})`;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


export const resumeReview = async (req, res) => {
    try {
      const { userId } = req.auth();
      const resume = req.file;
      const plan = req.plan;
  
      if (plan !== "premium") {
        return res.json({
          success: false,
          message: "This feature is only available for premium subscriptions",
        });
      }
  
      if(resume.size > 5 * 1024 *1024){
        return res.json({success: false, message: "Resume file size exceeds allows size (5MB)."})
      }

      const dataBuffer = fs.readFileSync(resume.path)

      const pdfData = await pdf(dataBuffer)

      const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and ares for improvement. Resume Content: \n\n${pdfData.text}`

      const response = await AI.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });
  
      const content = response.choices[0].message.content;
  
      await sql` INSERT INTO creations (user_id, prompt, content, type, original_prompt) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review', 'Review the uploaded resume')`;
  
      res.json({ success: true, content });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };


// ─── Regenerate a previous creation ─────────────────────────────────────

export const regenerateCreation = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { creationId } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // Fetch original creation
    const [original] = await sql`SELECT * FROM creations WHERE id = ${creationId} AND user_id = ${userId}`;
    if (!original) {
      return res.json({ success: false, message: "Creation not found" });
    }

    // Check limits for non-premium text generation
    if (plan !== "premium" && (original.type === 'article' || original.type === 'blog-title') && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue." });
    }

    // Premium-only features
    if (plan !== "premium" && (original.type === 'image' || original.type === 'resume-review')) {
      return res.json({ success: false, message: "This feature is only available for premium subscriptions" });
    }

    // Determine the root parent
    const rootId = original.parent_id || original.id;

    // Get max version for this chain
    const [maxVersionRow] = await sql`SELECT COALESCE(MAX(version), 0) as max_version FROM creations WHERE (id = ${rootId} OR parent_id = ${rootId}) AND user_id = ${userId}`;
    const newVersion = (maxVersionRow.max_version || 1) + 1;

    const originalPrompt = original.original_prompt || original.prompt;
    let content;

    if (original.type === 'article' || original.type === 'blog-title' || original.type === 'resume-review') {
      const response = await AI.chat.completions.create({
        model: GEMINI_MODEL,
        messages: [{ role: "user", content: originalPrompt }],
        temperature: 0.8, // Slightly higher for variation
        max_tokens: original.type === 'article' ? 1200 : original.type === 'resume-review' ? 1000 : 100,
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

    // Update free usage for non-premium
    if (plan !== "premium" && (original.type === 'article' || original.type === 'blog-title')) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content, version: newVersion });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};