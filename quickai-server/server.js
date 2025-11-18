import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoutes.js";
import initDb from "./config/initDb.js";

// Basic required env validation (fail fast if critical keys missing)
const requiredEnv = [
  "CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "GEMINI_API_KEY",
  "CLIPDROP_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    "\n[CONFIG ERROR] Missing required environment variables:",
    missing.join(", ")
  );
  console.error("Add them to your .env file before starting the server.");
  process.exit(1);
}

const app = express();

await connectCloudinary();
await initDb();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// dotenv.config()

app.get("/", (req, res) => res.send("Server is Live!"));

app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server is running in port", PORT);
});
