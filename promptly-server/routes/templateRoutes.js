import express from "express";
import { getTemplates, getTemplateById, generateFromTemplate } from "../controllers/templateController.js";
import { auth } from "../middleware/auth.js";

const templateRouter = express.Router();

templateRouter.get("/", auth, getTemplates);
templateRouter.get("/:id", auth, getTemplateById);
templateRouter.post("/generate", auth, generateFromTemplate);

export default templateRouter;
